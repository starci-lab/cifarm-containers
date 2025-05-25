import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    CreateConvertSolanaMetaplexNFTsTransactionRequest,
    CreateConvertSolanaMetaplexNFTsTransactionResponse
} from "./create-convert-solana-metaplex-nfts-transaction.dto"
import { AttributeName, SolanaService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { InjectCache, ConvertedNFT, ConvertSolanaMetaplexNFTsTransactionCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"

@Injectable()
export class CreateConvertSolanaMetaplexNFTsTransactionService {
    private readonly logger = new Logger(CreateConvertSolanaMetaplexNFTsTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
    ) { }

    async createConvertSolanaMetaplexNFTsTransaction(
        { id }: UserLike,
        {
            convertNFTAddresses,
            burnNFTType,
            nftType,
            accountAddress
        }: CreateConvertSolanaMetaplexNFTsTransactionRequest
    ): Promise<CreateConvertSolanaMetaplexNFTsTransactionResponse> {
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
                const conversionRate = this.staticService.nftConversion.conversionRate
                if (!conversionRate) {
                    throw new GraphQLError("Invalid conversion rate", {
                        extensions: {
                            code: "INVALID_CONVERSION_RATE"
                        }
                    })
                }
                if (convertNFTAddresses.length % conversionRate !== 0) {
                    throw new GraphQLError("Invalid number of NFTs to convert", {
                        extensions: {
                            code: "INVALID_NUMBER_OF_NFTs_TO_CONVERT"
                        }
                    })
                }
                const nftConverted = convertNFTAddresses.length / conversionRate
                const serializedTxs: Array<string> = []
                const cacheKeys: Array<string> = []
                const convertedNFTs: Array<ConvertedNFT> = []
                const burnNFTCollectionData = this.staticService.nftCollections[burnNFTType][
                    user.network
                ] as NFTCollectionData
                for (let i = 0; i < nftConverted; i++) {
                    // create a transaction to buy the golds
                    const { limitTransaction, priceTransaction } =
                        await this.solanaService.createComputeBudgetTransactions({
                            network: user.network
                        })
                    let builder = transactionBuilder().add(limitTransaction).add(priceTransaction)
                    // burn the nfts

                    for (let iConvert = 0; iConvert < conversionRate; iConvert++) {
                        const { transaction: createBurnNFTTransaction } =
                            await this.solanaService.createBurnNFTTransaction({
                                network: user.network,
                                nftAddress: convertNFTAddresses[i * conversionRate + iConvert],
                                collectionAddress: burnNFTCollectionData.collectionAddress,
                                feePayer: accountAddress
                            })
                        builder = builder.add(createBurnNFTTransaction)
                    }

                    // mint the nft based on the nft type

                    const nftCollectionData = this.staticService.nftCollections[nftType][
                        user.network
                    ] as NFTCollectionData
                    const nftName = nftCollectionData.name
                    const { transaction: createMintNFTTransaction, nftAddress, nftName: actualNFTName } =
                        await this.solanaService.createMintNFTTransaction({
                            network: user.network,
                            attributes: [
                                ...Object.entries(nftCollectionData.rarities[NFTRarity.Common]).map(
                                    ([key, value]) => ({
                                        key,
                                        value
                                    })
                                ),
                                {
                                    key: AttributeName.CurrentStage,
                                    value: "0"
                                },
                                {
                                    key: AttributeName.Rarity,
                                    value: NFTRarity.Common
                                }
                            ],
                            ownerAddress: accountAddress,
                            collectionAddress: nftCollectionData.collectionAddress,
                            feePayer: accountAddress,
                            name: nftCollectionData.name,
                            metadata: {
                                name: nftName,
                                image: nftCollectionData.fruitStages.stages[0].imageUrl
                            }
                        })
                    builder = builder.add(createMintNFTTransaction)
                    convertedNFTs.push({ nftName: actualNFTName, nftType, rarity: NFTRarity.Common, nftAddress })
                    const transaction = await builder
                        .useV0()
                        .setFeePayer(createNoopSigner(publicKey(accountAddress)))
                        .buildAndSign(this.solanaService.getUmi(user.network))
                    // store the transaction in the cache
                    const cacheKey = this.sha256Service.hash(
                        base58.encode(
                            this.solanaService
                                .getUmi(user.network)
                                .transactions.serializeMessage(transaction.message)
                        )
                    )
                    serializedTxs.push(base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serialize(transaction)
                    ))
                    cacheKeys.push(cacheKey)
                }

                const finalCacheKey = this.sha256Service.hash(cacheKeys.join(""))
                const cacheData: ConvertSolanaMetaplexNFTsTransactionCache = {
                    convertedNFTs,
                    network: user.network
                }
                await this.cacheManager.set(finalCacheKey, cacheData, 1000 * 60 * 15) // 15 minutes to verify the transaction
                return {
                    serializedTxs
                }
            })
            return {
                success: true,
                message: "NFT converted transaction created successfully",
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
