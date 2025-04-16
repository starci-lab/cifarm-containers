import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import {
    FreezeSolanaMetaplexNFTRequest,
    FreezeSolanaMetaplexNFTResponse
} from "./freeze-solana-metaplex-nft.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { NFTMetadataSchema } from "@src/databases"

@Injectable()
export class FreezeSolanaMetaplexNFTService {
    private readonly logger = new Logger(FreezeSolanaMetaplexNFTService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
    ) {}

    async freezeSolanaMetaplexNFT(
        { id }: UserLike,
        { nftAddress, collectionAddress }: FreezeSolanaMetaplexNFTRequest
    ): Promise<FreezeSolanaMetaplexNFTResponse> {
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
                const { network, accountAddress } = user
                const nft = await this.solanaMetaplexService.getNFT({
                    nftAddress,
                    network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND"
                        }
                    })
                }
                if (nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is already frozen", {
                        extensions: {
                            code: "NFT_ALREADY_FROZEN"
                        }
                    })
                }
                if (nft.owner !== accountAddress) {
                    throw new GraphQLError("You are not the owner of this NFT", {
                        extensions: {
                            code: "NOT_OWNER"
                        }
                    })
                }
                // create a versionel transaction to free the nft from the collection
                const { serializedTx } = await this.solanaMetaplexService.createFreezeNFTTransaction({
                    nftAddress,
                    collectionAddress,
                    network,
                    feePayer: accountAddress
                })
                // create a nft metadata to track the nft status
                // recall the validate to set the frozen status to true
                const foundNFTMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        nftAddress,
                        collectionAddress,
                        user: id
                    }).session(session)
                if (!foundNFTMetadata) {
                    await this.connection
                        .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                        .create([{
                            nftAddress,
                            collectionAddress,
                            user: id,
                            validated: false,
                            nftName: nft.name,
                        }], { session })
                }
                return {
                    message: "NFT frozen transaction created",
                    success: true,
                    data: {
                        serializedTx
                    },
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
