import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTMetadataSchema, PlacedItemSchema, placedItemTypeIdToNFTType } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    SendUnwrapSolanaMetaplexNFTTransactionRequest,
    SendUnwrapSolanaMetaplexNFTTransactionResponse
} from "./send-unwrap-solana-metaplex-nft-transaction.dto"
import { MetaplexNFTMetadata, SolanaService } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
import base58 from "bs58"
import { Sha256Service } from "@src/crypto"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { UnwrapSolanaMetaplexNFTTransactionCache } from "@src/cache"
import { StaticService } from "@src/gameplay"
import { S3Service } from "@src/s3"
@Injectable()
export class SendUnwrapSolanaMetaplexNFTTransactionService {
    private readonly logger = new Logger(SendUnwrapSolanaMetaplexNFTTransactionService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly sha256Service: Sha256Service,
        private readonly staticService: StaticService,
        private readonly s3Service: S3Service,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {}

    async sendUnwrapSolanaMetaplexNFTTransaction(
        { id }: UserLike,
        { serializedTx }: SendUnwrapSolanaMetaplexNFTTransactionRequest
    ): Promise<SendUnwrapSolanaMetaplexNFTTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Get the user
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

                const cacheData =
                    await this.cacheManager.get<UnwrapSolanaMetaplexNFTTransactionCache>(cacheKey)
                if (!cacheData) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }

                // Get NFT metadata
                const nftMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        _id: cacheData.nftMetadataId
                    })
                    .session(session)
                if (!nftMetadata) {
                    throw new GraphQLError("NFT metadata not found", {
                        extensions: {
                            code: "NFT_METADATA_NOT_FOUND"
                        }
                    })
                }

                // Get placed item
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

                // delete the nft metadata
                await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .deleteOne({
                        _id: nftMetadata.id
                    })
                    .session(session)
                // delete the placed item
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .deleteOne({
                        _id: placedItem.id
                    })
                    .session(session)

                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType.toString()
                )
                const nftCollectionData = this.staticService.nftCollections[
                    placedItemTypeIdToNFTType[placedItemType.displayId]
                ][
                    user.network
                ] as NFTCollectionData
                const s3Json = await this.s3Service.getJson<MetaplexNFTMetadata>(nftMetadata.nftAddress)
                s3Json.data.image = nftCollectionData.fruitStages.stages[placedItem.fruitInfo.currentStage].imageUrl
                await s3Json.save()

                // Sign and send transaction
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
                    data: {
                        txHash: base58.encode(txHash)
                    },
                    success: true,
                    message: "Unwrap Solana Metaplex NFT Transaction sent successfully"
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
