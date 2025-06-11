import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity, NFTCollectionKey } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    CreatePurchaseSuiNFTBoxesTransactionResponse,
    CreatePurchaseSuiNFTBoxesTransactionRequest
} from "./create-purchase-sui-nft-boxes-transaction.dto"
import { AttributeName } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ExtendedNFTBox } from "@src/cache"
import { ChainKey } from "@src/env"
import { v4 as uuidv4 } from "uuid"
import { SuiService } from "@src/blockchain"
import { Transaction } from "@mysten/sui/transactions"

@Injectable()
export class CreatePurchaseSuiNFTBoxesTransactionService {
    private readonly logger = new Logger(CreatePurchaseSuiNFTBoxesTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly suiService: SuiService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async createPurchaseSuiNFTBoxesTransaction(
        { id }: UserLike,
        {
            accountAddress,
            chainKey = ChainKey.Sui,
            quantity
        }: CreatePurchaseSuiNFTBoxesTransactionRequest
    ): Promise<CreatePurchaseSuiNFTBoxesTransactionResponse> {
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
                const serializedTxs: Array<string> = []
                const extendedNFTBoxes: Array<ExtendedNFTBox> = []
                for (const nftBox of nftBoxes) {
                    const transaction = new Transaction()
                    // nft collection data
                    const nftCollectionData = this.staticService.nftCollections[nftBox.nftCollectionKey][chainKey][
                        user.network
                    ] as NFTCollectionData
                    const currentStage = 0
                    // get the current stage
                    await this.suiService.createMintNFTTransaction({
                        transaction,
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
                        ownerAddress: accountAddress,
                        collectionAddress: nftCollectionData.collectionAddress,
                        metadata: {
                            name: nftCollectionData.name,
                            image: nftCollectionData.fruitStages.stages[currentStage].imageUrl,
                            description: "",
                        },
                        nftTreasuryCapId: nftCollectionData.suiNFTTreasuryCapId,
                        name: nftCollectionData.name,
                    })
                    
                    extendedNFTBoxes.push({
                        nftName: nftCollectionData.name,
                        nftCollectionKey: nftBox.nftCollectionKey,
                        rarity: nftBox.rarity
                    })

                    //get the stable coin address
                    //     const { tokenAddress, decimals: tokenDecimals } =
                    // this.staticService.tokens[StableCoinName.USDC][chainKey][user.network]
                    //     // first season is USDC so that we hardcode the token address
                    //     const tokenVaultAddress = this.s
                    //         .getVaultUmi(user.network)
                    //         .identity.publicKey.toString()
                    //     const feeAmount = roundNumber(
                    //         this.staticService.nftBoxInfo.boxPrice *
                    //     this.staticService.nftBoxInfo.feePercentage
                    //     )
                    //     const tokenAmount = this.staticService.nftBoxInfo.boxPrice - feeAmount
                    //     totalTokenAmount += tokenAmount
                    //     const { transaction: transferTokenToVaultTransaction } =
                    // await this.SuiMetaplexService.createTransferTokenTransaction({
                    //     network: user.network,
                    //     tokenAddress: tokenAddress,
                    //     toAddress: tokenVaultAddress,
                    //     amount: tokenAmount,
                    //     decimals: tokenDecimals,
                    //     fromAddress: accountAddress
                    // })
                    //     // add to the transaction
                    //     builder = builder.add(transferTokenToVaultTransaction)
                    //     // get the fee receiver address
                    //     const revenueRecipientAddress =
                    // this.staticService.revenueRecipients[ChainKey.Sui][user.network].address
                    //     const { transaction: transferTokenToFeeReceiverTransaction } =
                    // await this.SuiMetaplexService.createTransferTokenTransaction({
                    //     network: user.network,
                    //     tokenAddress: tokenAddress,
                    //     toAddress: revenueRecipientAddress,
                    //     amount: feeAmount,
                    //     decimals: tokenDecimals,
                    //     fromAddress: accountAddress
                    // })
                    //     builder = builder.add(transferTokenToFeeReceiverTransaction)
                    //     const transaction = await builder
                    //         .useV0()
                    //         .setFeePayer(createNoopSigner(publicKey(accountAddress)))
                    //         .buildAndSign(this.SuiMetaplexService.getUmi(user.network))
                    //     serializedTxs.push(
                    //         base58.encode(
                    //             this.SuiMetaplexService
                    //                 .getUmi(user.network)
                    //                 .transactions.serialize(transaction)
                    //         )
                    //     )
                    // store the transaction in the cache
                    // const cacheKey = this.sha256Service.hash(
                    //     base58.encode(
                    //         this.SuiMetaplexService
                    //             .getUmi(user.network)
                    //             .transactions.serializeMessage(transaction.message)
                    //     )
                    // )
                    // cacheKeys.push(cacheKey)
                    const serializedTx = await transaction.toJSON()
                    serializedTxs.push(serializedTx)
                }    

                // const finalCacheKey = this.sha256Service.hash(cacheKeys.join(""))

                // const cacheData: PurchaseSuiNFTBoxTransactionCache = {
                //     nftBoxes: extendedNFTBoxes,
                //     chainKey,
                //     tokenAmount: totalTokenAmount,
                //     network: user.network
                // }
                // await this.cacheManager.set(finalCacheKey, cacheData, 1000 * 60 * 15) // 15 minutes to verify the transaction
                return {
                    serializedTxs
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
            
            const computedNFTCollectionKey = parseInt(hashedVector[0], 16) / 16
            const computedRarity = parseInt(hashedVector[1], 16) / 16

            const nftBoxChance = this.staticService.nftBoxInfo.chances.find((chance) =>
                computedNFTCollectionKey >= chance.startChance && computedNFTCollectionKey < chance.endChance
            )
    
            if (!nftBoxChance) {
                throw new GraphQLError("NFT starter box chance not found")
            }
    
            const nftCollectionKey: NFTCollectionKey = nftBoxChance.nftCollectionKey
    
            let rarity: NFTRarity
            if (computedRarity > nftBoxChance.epicRarityChance) {
                rarity = NFTRarity.Epic
            } else if (computedRarity > nftBoxChance.rareRarityChance) {
                rarity = NFTRarity.Rare
            } else {
                rarity = NFTRarity.Common
            }
            nftBoxes.push({
                nftCollectionKey,
                rarity
            })
        }
        return nftBoxes
    }
}

export interface NFTBox {
    nftCollectionKey: NFTCollectionKey
    rarity: NFTRarity
}
