import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    NFT_METADATA,
    PlacedItemSchema,
    NFTMetadataSchema,
    NFTCollectionKey,
    NFTCollectionKeyToPlacedItemTypeId,
    PlacedItemType,
    FruitCurrentState
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    SendWrapSolanaMetaplexNFTTransactionRequest,
    SendWrapSolanaMetaplexNFTTransactionResponse
} from "./send-wrap-solana-metaplex-nft-transaction.dto"
import { AttributeName, SolanaService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { InjectCache, WrapSolanaMetaplexNFTTransactionCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import base58 from "bs58"

@Injectable()
export class SendWrapSolanaMetaplexNFTTransactionService {
    private readonly logger = new Logger(SendWrapSolanaMetaplexNFTTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
    ) { }

    async sendWrapSolanaMetaplexNFTTransaction(
        { id }: UserLike,
        { serializedTx }: SendWrapSolanaMetaplexNFTTransactionRequest
    ): Promise<SendWrapSolanaMetaplexNFTTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // get the user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new Error("User not found")
                }
                const tx = this.solanaService
                    .getUmi(user.network)
                    .transactions.deserialize(base58.decode(serializedTx))
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serializeMessage(tx.message)
                    )
                )
                const cacheData = await this.cacheManager.get<WrapSolanaMetaplexNFTTransactionCache>(cacheKey)
                if (!cacheData) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const nftMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findById(cacheData.nftMetadataId)
                    .session(session)
                if (!nftMetadata) {
                    throw new GraphQLError("NFT metadata not found", {
                        extensions: {
                            code: "NFT_METADATA_NOT_FOUND"
                        }
                    })
                }
                const nft = await this.solanaService.getNFT({
                    nftAddress: nftMetadata.nftAddress,
                    network: user.network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND"
                        }
                    })
                }
                if (nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is frozen", {
                        extensions: {
                            code: "NFT_FROZEN"
                        }
                    })
                }
                if (nftMetadata.validated) {
                    throw new GraphQLError("NFT is already validated", {
                        extensions: {
                            code: "NFT_ALREADY_VALIDATED"
                        }
                    })
                }
                nftMetadata.validated = true
                await nftMetadata.save({ session })
                // thus, base on nft type, we create corresponding off-chain, first is about the fruits
                let nftCollectionKey: NFTCollectionKey
                for (const _nftCollectionKey of Object.values(NFTCollectionKey)) {
                    const found = this.staticService.nftCollections[_nftCollectionKey][user.network].collectionAddress ===
                        nftMetadata.collectionAddress
                    if (found) {
                        nftCollectionKey = _nftCollectionKey
                        break
                    }
                }
                if (!nftCollectionKey) {
                    throw new GraphQLError("NFT type not found", {
                        extensions: {
                            code: "NFT_TYPE_NOT_FOUND"
                        }
                    })
                }
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.displayId === NFTCollectionKeyToPlacedItemTypeId[nftCollectionKey]
                )
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                switch (placedItemType.type) {
                case PlacedItemType.Fruit: {
                    const placedItemTypeId = NFTCollectionKeyToPlacedItemTypeId[nftCollectionKey]
                    const placedItemType = this.staticService.placedItemTypes.find(
                        (placedItemType) => placedItemType.displayId === placedItemTypeId
                    )
                    if (!placedItemType) {
                        throw new GraphQLError("Placed item type not found", {
                            extensions: {
                                code: "PLACED_ITEM_TYPE_NOT_FOUND"
                            }
                        })
                    }
                    const currentStage = Number.parseInt(nft.attributes.attributeList.find(
                        (attribute) => attribute.key === AttributeName.CurrentStage
                    )?.value) || 0
                    let currentState: FruitCurrentState
                    if (currentStage === this.staticService.fruitInfo.growthStages - 1) {
                        currentState = FruitCurrentState.FullyMatured
                    } else if (currentStage >= this.staticService.fruitInfo.matureGrowthStage) {
                        currentState = FruitCurrentState.IsBuggy
                    } else {
                        currentState = FruitCurrentState.NeedFertilizer
                    }
                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create([
                            {
                                user: id,
                                // since x,y is required, we set both to 0
                                x: 0,
                                y: 0,
                                placedItemType: placedItemType.id,
                                fruitInfo: {
                                    [AttributeName.QualityYield]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.QualityYield
                                    )?.value,
                                    [AttributeName.GrowthAcceleration]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.GrowthAcceleration
                                    )?.value,
                                    [AttributeName.HarvestYieldBonus]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.HarvestYieldBonus
                                    )?.value,
                                    [AttributeName.DiseaseResistance]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.DiseaseResistance
                                    )?.value,
                                    currentStage,
                                    currentState
                                },
                                [NFT_METADATA]: nftMetadata.id,
                                isStored: true
                            }
                        ],
                        { session }
                        )
                    break
                }
                default:
                    throw new GraphQLError("NFT type not supported", {
                        extensions: {
                            code: "NFT_TYPE_NOT_SUPPORTED"
                        }
                    })
                }
                const signedTx = await this.solanaService
                    .getUmi(user.network)
                    .identity.signTransaction(tx)
                const txHash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.sendTransaction(signedTx)
                const latestBlockhash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.getLatestBlockhash()
                await this.solanaService
                    .getUmi(user.network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                return {
                    success: true,
                    message: "Wrap Solana Metaplex NFT transaction sent successfully",
                    data: {
                        txHash: base58.encode(txHash)
                    }
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
