import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTMetadataSchema, PlacedItemSchema, PlacedItemType } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    CreateUnwrapSolanaMetaplexNFTTransactionRequest,
    CreateUnwrapSolanaMetaplexNFTTransactionResponse
} from "./create-unwrap-solana-metaplex-nft-transaction.dto"
import { AttributeName, SolanaService } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
import base58 from "bs58"
import { Sha256Service } from "@src/crypto"
import { publicKey, createNoopSigner, transactionBuilder } from "@metaplex-foundation/umi"
import { InjectCache, UnwrapSolanaMetaplexNFTTransactionCache } from "@src/cache"
import { Cache } from "cache-manager"
import { StaticService } from "@src/gameplay"

@Injectable()
export class CreateUnwrapSolanaMetaplexNFTTransactionService {
    private readonly logger = new Logger(CreateUnwrapSolanaMetaplexNFTTransactionService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly sha256Service: Sha256Service,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {}

    async createUnwrapSolanaMetaplexNFTTransaction(
        { id }: UserLike,
        { nftAddress, collectionAddress }: CreateUnwrapSolanaMetaplexNFTTransactionRequest
    ): Promise<CreateUnwrapSolanaMetaplexNFTTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Get NFT from blockchain
                const nft = await this.solanaService.getNFT({
                    nftAddress,
                    network: user.network
                })
                const accountAddress = nft.owner
                if (!nft) {
                    throw new GraphQLError("NFT not found on blockchain", {
                        extensions: {
                            code: "NFT_NOT_FOUND_ON_BLOCKCHAIN"
                        }
                    })
                }

                if (!nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is not frozen", {
                        extensions: {
                            code: "NFT_NOT_FROZEN"
                        }
                    })
                }

                // Create unfreeze transaction
                const { limitTransaction, priceTransaction } =
                    await this.solanaService.createComputeBudgetTransactions({
                        network: user.network
                    })
                let builder = transactionBuilder().add(limitTransaction).add(priceTransaction)
                const { transaction: unfreezeTransaction } =
                    await this.solanaService.createUnfreezeNFTTransaction({
                        nftAddress,
                        collectionAddress,
                        network: user.network,
                        feePayer: accountAddress
                    })
                builder = builder.add(unfreezeTransaction)

                // get the nft metadata
                const nftMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        nftAddress,
                        network: user.network,
                        collectionAddress
                    })
                    .session(session)
                if (!nftMetadata) {
                    throw new GraphQLError("NFT metadata not found", {
                        extensions: {
                            code: "NFT_METADATA_NOT_FOUND"
                        }
                    })
                }
                // get the placed item
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findOne({
                        nftMetadata: nftMetadata.id
                    })
                    .session(session)
                if (!placedItem) {
                    throw new GraphQLError("Placed item not found", {
                        extensions: {
                            code: "PLACED_ITEM_NOT_FOUND"
                        }
                    })
                }
                const attributes = nft.attributes.attributeList
                // base on the placed item type, we can update the attributes
                const placedItemType = this.staticService.placedItemTypes.find(
                    placedItemType => 
                        placedItemType.id === placedItem.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                switch (placedItemType.type) {
                case PlacedItemType.Fruit:
                {
                    if (!placedItem.fruitInfo) {
                        throw new GraphQLError("Fruit info not found", {
                            extensions: {
                                code: "FRUIT_INFO_NOT_FOUND"
                            }
                        })
                    }
                    // get the stage attribute
                    const stageAttribute = attributes.find(attribute => attribute.key === AttributeName.CurrentStage)
                    if (!stageAttribute) {
                        // add the stage attribute
                        attributes.push({
                            key: AttributeName.CurrentStage,
                            value: placedItem.fruitInfo.currentStage.toString()
                        })
                    } else {
                        // update the stage attribute
                        stageAttribute.value = placedItem.fruitInfo.currentStage.toString()
                    }
                    break
                }
                default: {
                    break
                }
                }
                // Create upgrade transaction
                const { transaction: upgradeTransaction } =
                    await this.solanaService.createUpgradeNFTTransaction({
                        nftAddress,
                        collectionAddress,
                        network: user.network,
                        feePayer: accountAddress,
                        attributes 
                    })
                builder = builder.add(upgradeTransaction)

                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(accountAddress)))
                    .buildAndSign(this.solanaService.getUmi(user.network))

                // Store transaction in cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )

                const cacheData: UnwrapSolanaMetaplexNFTTransactionCache = {
                    nftMetadataId: nftMetadata.id,
                }

                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes

                return {
                    data: {
                        serializedTx: base58.encode(
                            this.solanaService
                                .getUmi(user.network)
                                .transactions.serialize(transaction)
                        )
                    },
                    success: true,
                    message: "Unwrap Solana Metaplex NFT Transaction created successfully"
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
