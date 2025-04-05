import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose
} from "@src/databases"
import { Connection } from "mongoose"
import { WrapSolanaMetaplexNFTRequest, WrapSolanaMetaplexNFTResponse } from "./wrap-solana-metaplex-nft.dto"
import { HoneycombService } from "@src/honeycomb"
import { StaticService } from "@src/gameplay"
import { SolanaMetaplexService } from "@src/blockchain"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"

@Injectable()
export class WrapSolanaMetaplexNFTService {
    private readonly logger = new Logger(WrapSolanaMetaplexNFTService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService
    ) {}

    async wrapSolanaMetaplexNft(
        { id }: UserLike,
        {
            nftAddress,
        }: WrapSolanaMetaplexNFTRequest): Promise<WrapSolanaMetaplexNFTResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const { accountAddress, network } = await this.connection.model<UserSchema>(UserSchema.name).findById(id).session(session)
                const nft = await this.solanaMetaplexService.getNft({
                    nftAddress,
                    network,
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND",
                        },
                    })
                }
                const characterModelAddress = this.staticService.honeycombInfo.characterModels.dragonFruit.testnet
                const { txResponses } = await this.honeycombService.createWrapAssetsToCharacterTransactions({
                    characterModelAddress,
                    mintAddresses: [nftAddress],
                    projectAddress: this.staticService.honeycombInfo.projectAddress,
                    walletAddress: accountAddress,
                    network,
                })
                return {
                    message: "NFT wrapped successfully",
                    success: true,
                    data: txResponses,
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
