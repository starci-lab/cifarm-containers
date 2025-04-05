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
import { PrepareFrozenNFTSchema } from "@src/databases"

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
                const { network, accountAddress } = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                const nft = await this.solanaMetaplexService.getNft({
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
                if (nft.freezeDelegate.frozen) {
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
                    network
                })
                // create a prepare frozen document
                await this.connection
                    .model<PrepareFrozenNFTSchema>(PrepareFrozenNFTSchema.name)
                    .create([{
                        nftAddress,
                        collectionAddress,
                        user: id
                    }], { session })

                return {
                    message: "NFT frozen successfully and item created",
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
