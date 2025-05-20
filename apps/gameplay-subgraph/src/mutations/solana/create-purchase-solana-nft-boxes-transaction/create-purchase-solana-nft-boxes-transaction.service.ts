import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity, NFTType, StableCoinName } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    CreatePurchaseSolanaNFTBoxesTransactionResponse,
    CreatePurchaseSolanaNFTBoxesTransactionRequest
} from "./create-purchase-solana-nft-boxes-transaction.dto"
import { AttributeName, SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { roundNumber } from "@src/common"
import { PurchaseSolanaNFTBoxTransactionCache, ExtendedNFTBox } from "@src/cache"
import { ChainKey } from "@src/env"
import { v4 as uuidv4 } from "uuid"
@Injectable()
export class CreatePurchaseSolanaNFTBoxesTransactionService {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTBoxesTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async createPurchaseSolanaNFTBoxesTransaction(
        { id }: UserLike,
        {
            accountAddress,
            chainKey = ChainKey.Solana,
            quantity
        }: CreatePurchaseSolanaNFTBoxesTransactionRequest
    ): Promise<CreatePurchaseSolanaNFTBoxesTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found")
                }

                const isStarterBoxUnset = !(
                    user.nftBoxVector
                )
                if (isStarterBoxUnset) {
                    user.nftBoxVector = uuidv4()
                    await user.save({ session })
                }

                const nftBoxes = await this.createNFTBoxesArr(user.nftBoxVector, quantity)
                const { limitTransaction, priceTransaction } =
                    await this.solanaMetaplexService.createComputeBudgetTransactions({
                        network: user.network
                    })
                let builder = transactionBuilder().add(limitTransaction).add(priceTransaction)
                const extendedNFTBoxes: Array<ExtendedNFTBox> = []
                for (const nftBox of nftBoxes) {
                    const nftCollectionData = this.staticService.nftCollections[nftBox.nftType][chainKey][
                        user.network
                    ] as NFTCollectionData

                    const nftName = nftCollectionData.name
                    const currentStage = 0
                    const { transaction: mintNFTTransaction, nftName: actualNFTName } =
                    await this.solanaMetaplexService.createMintNFTTransaction({
                        network: user.network,
                        ownerAddress: accountAddress,
                        attributes: [
                            ...Object.entries(nftCollectionData.rarities[nftBox.rarity]).map(
                                ([key, value]) => ({
                                    key,
                                    value
                                })
                            ),
                            {
                                key: AttributeName.CurrentStage,
                                value: currentStage.toString()
                            },
                            {
                                key: AttributeName.Rarity,
                                value: nftBox.rarity
                            }
                        ],
                        collectionAddress: nftCollectionData.collectionAddress,
                        name: nftName,
                        feePayer: accountAddress,
                        metadata: {
                            name: nftName,
                            image: nftCollectionData.fruitStages.stages[currentStage].imageUrl
                        }
                    })
                    builder = builder.add(mintNFTTransaction)
                    extendedNFTBoxes.push({
                        nftName: actualNFTName,
                        nftType: nftBox.nftType,
                        rarity: nftBox.rarity
                    })
                }   
               
                //get the stable coin address
                const { tokenAddress, decimals: tokenDecimals } =
                    this.staticService.tokens[StableCoinName.USDC][chainKey][user.network]
                // first season is USDC so that we hardcode the token address
                const tokenVaultAddress = this.solanaMetaplexService
                    .getVaultUmi(user.network)
                    .identity.publicKey.toString()
                const feeAmount = roundNumber(
                    this.staticService.nftBoxInfo.boxPrice *
                        this.staticService.nftBoxInfo.feePercentage
                ) * quantity
                const tokenAmount = this.staticService.nftBoxInfo.boxPrice * quantity - feeAmount
                const { transaction: transferTokenToVaultTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress: tokenAddress,
                        toAddress: tokenVaultAddress,
                        amount: tokenAmount,
                        decimals: tokenDecimals,
                        fromAddress: accountAddress
                    })
                // add to the transaction
                builder = builder.add(transferTokenToVaultTransaction)
                // get the fee receiver address
                const revenueRecipientAddress =
                    this.staticService.revenueRecipients[ChainKey.Solana][user.network].address
                const { transaction: transferTokenToFeeReceiverTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress: tokenAddress,
                        toAddress: revenueRecipientAddress,
                        amount: feeAmount,
                        decimals: tokenDecimals,
                        fromAddress: accountAddress
                    })
                builder = builder.add(transferTokenToFeeReceiverTransaction)
                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(accountAddress)))
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))
                // store the transaction in the cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )

                const cacheData: PurchaseSolanaNFTBoxTransactionCache = {
                    nftBoxes: extendedNFTBoxes,
                    chainKey,
                    tokenAmount,
                    network: user.network
                }
                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes to verify the transaction
                return {
                    serializedTx: base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serialize(transaction)
                    )
                }
            })
            return {
                success: true,
                message: "NFT starter box purchased successfully",
                data: result
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    private async createNFTBoxesArr(
        vector: string,
        numberOfBoxes: number
    ): Promise<Array<NFTBox>> {
        const nftBoxes: Array<NFTBox> = []
    
        for (let i = 0; i < numberOfBoxes; i++) {
            const hashedVector = this.sha256Service.hash(`${vector}-${i}`)
    
            // Sum all characters in the hex hash string (convert each hex char to int)
            const sum = [...hashedVector].reduce((acc, char) => acc + parseInt(char, 16), 0)
    
            // Normalize sum into a value within 0-999
            const computedValue = sum % 1000
    
            // NFT Type determination: use 2 last digits to determine the nft type
            const computedNFTType = (computedValue % 100) / 100
            // Rarity determination: use 2 first digits to determine the rarity
            const computedRarity = Math.floor(computedValue / 100) / 100
    
            const nftBoxChance = this.staticService.nftBoxInfo.chances.find((chance) =>
                computedNFTType >= chance.startChance && computedNFTType < chance.endChance
            )
    
            if (!nftBoxChance) {
                throw new GraphQLError("NFT starter box chance not found")
            }
    
            const nftType: NFTType = nftBoxChance.nftType
    
            let rarity: NFTRarity
            if (computedRarity < nftBoxChance.rareRarityChance) {
                rarity = NFTRarity.Rare
            } else if (computedRarity < nftBoxChance.epicRarityChance) {
                rarity = NFTRarity.Epic
            } else {
                rarity = NFTRarity.Common
            }
    
            nftBoxes.push({
                nftType,
                rarity
            })
        }
    
        return nftBoxes
    }
}

export interface NFTBox {
    nftType: NFTType
    rarity: NFTRarity
}
