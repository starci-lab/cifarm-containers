import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { SolanaMetaplexService } from "@src/blockchain"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { NFTMetadataSchema } from "@src/databases"
import {
    UnfreezeSolanaMetaplexNFTRequest,
    UnfreezeSolanaMetaplexNFTResponse
} from "./unfreeze-solana-metaplex-nft.dto"

@Injectable()
export class UnfreezeSolanaMetaplexNFTService {
    private readonly logger = new Logger(UnfreezeSolanaMetaplexNFTService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
    ) {}

    async unfreezeSolanaMetaplexNFT(
        { id }: UserLike,
        { nftAddress }: UnfreezeSolanaMetaplexNFTRequest
    ): Promise<UnfreezeSolanaMetaplexNFTResponse> {
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
                const nft = await this.solanaMetaplexService.getNft({
                    nftAddress,
                    network: user.network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND"
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
                if (nft.owner !== user.accountAddress) {
                    throw new GraphQLError("NFT is not owned by the user", {
                        extensions: {
                            code: "NFT_NOT_OWNED"
                        }
                    })
                }
                
                const { network, accountAddress } = user
                const metadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        nftAddress,
                        user: id
                    })
                if (metadata) {
                    await metadata.deleteOne({ session })
                    const placedItem = await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .findOne({
                            nftMetadata: metadata.id
                        }).session(session) 
                    // delete if exists
                    if (placedItem) {
                        await placedItem.deleteOne({ session })
                    }
                }        
                const { serializedTx } = await this.solanaMetaplexService.createUnfreezeNFTTransaction({
                    nftAddress,
                    network,
                    feePayer: accountAddress,
                    collectionAddress: metadata.collectionAddress
                })         
                return {
                    data: {
                        serializedTx
                    },
                    success: true,
                    message: "NFT unfrozen successfully"
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
