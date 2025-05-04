import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity, StableCoinName } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { CreatePurchaseSolanaNFTBoxTransactionResponse } from "./create-purchase-solana-nft-box-transaction.dto"
import { AttributeName, SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { NFTDatabaseService } from "@src/blockchain-database"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { roundNumber } from "@src/common"
import { PurchaseSolanaNFTBoxTransactionCache } from "@src/cache"
import { S3Service } from "@src/s3"

@Injectable()
export class CreatePurchaseSolanaNFTBoxTransactionService {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTBoxTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        private readonly nftDatabaseService: NFTDatabaseService,
        private readonly s3Service: S3Service,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async createPurchaseSolanaNFTBoxTransaction({
        id
    }: UserLike): Promise<CreatePurchaseSolanaNFTBoxTransactionResponse> {
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
                    user.lastSolanaNFTBoxRollRarity && user.lastSolanaNFTBoxRollType
                )
                if (isStarterBoxUnset) {
                    user.lastSolanaNFTBoxRollRarity = Math.random()
                    user.lastSolanaNFTBoxRollType = Math.random()
                    await user.save({ session })
                }
                const NFTBoxChances = this.staticService.nftBoxInfo.chances
                const NFTBoxChance = NFTBoxChances.find((chance) => {
                    return (
                        user.lastSolanaNFTBoxRollRarity >= chance.startChance &&
                        user.lastSolanaNFTBoxRollRarity < chance.endChance
                    )
                })
                if (!NFTBoxChance) {
                    throw new GraphQLError("NFT starter box chance not found")
                }
                let rarity: NFTRarity
                if (user.lastSolanaNFTBoxRollType < NFTBoxChance.rareRarityChance) {
                    rarity = NFTRarity.Rare
                } else if (
                    user.lastSolanaNFTBoxRollType < NFTBoxChance.epicRarityChance
                ) {
                    rarity = NFTRarity.Epic
                } else {
                    rarity = NFTRarity.Common
                }
                const { nftType } = NFTBoxChance
                const nftCollectionData = this.staticService.nftCollections[nftType][user.chainKey][
                    user.network
                ] as NFTCollectionData

                let builder = transactionBuilder()
                const nftName = nftCollectionData.name
                const currentStage = 0
                const { transaction: mintNFTTransaction, nftName: actualNFTName } =
                    await this.solanaMetaplexService.createMintNFTTransaction({
                        network: user.network,
                        ownerAddress: user.accountAddress,
                        attributes: [
                            ...Object.entries(nftCollectionData.rarities[rarity]).map(
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
                                value: rarity
                            }
                        ],
                        collectionAddress: nftCollectionData.collectionAddress,
                        name: nftName,
                        feePayer: user.accountAddress,
                        metadata: {
                            name: nftName,
                            image: nftCollectionData.fruitStages.stages[currentStage].imageUrl
                        }
                    })
                builder = builder.add(mintNFTTransaction)
                //get the stable coin address
                const { address: tokenAddress, decimals: tokenDecimals } =
                    this.staticService.stableCoins[StableCoinName.USDC][user.chainKey][user.network]
                // first season is USDC so that we hardcode the token address
                const tokenVaultAddress = this.solanaMetaplexService.getVaultUmi(user.network).identity.publicKey.toString()
                const feeAmount = roundNumber(this.staticService.nftBoxInfo.boxPrice * this.staticService.nftBoxInfo.feePercentage)
                const tokenAmount = this.staticService.nftBoxInfo.boxPrice - feeAmount
                const { transaction: transferTokenToVaultTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress: tokenAddress,
                        toAddress: tokenVaultAddress,
                        amount: tokenAmount,
                        decimals: tokenDecimals,
                        fromAddress: user.accountAddress
                    })
                // add to the transaction
                builder = builder.add(transferTokenToVaultTransaction)  
                // get the fee receiver address
                const revenueRecipientAddress = this.staticService.revenueRecipients[user.chainKey][user.network].address
                const { transaction: transferTokenToFeeReceiverTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress: tokenAddress,
                        toAddress: revenueRecipientAddress,
                        amount: feeAmount,
                        decimals: tokenDecimals,
                        fromAddress: user.accountAddress
                    })
                builder = builder.add(transferTokenToFeeReceiverTransaction)
                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(user.accountAddress)))
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
                    nftType,
                    rarity,
                    tokenAmount,
                    nftName: actualNFTName
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
}
