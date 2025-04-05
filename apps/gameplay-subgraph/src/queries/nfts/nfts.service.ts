import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import {
    GetSolanaMetaplexNFTResponse,
    GetSolanaMetaplexNFTRequest,
    MetaplexNFTStatus
} from "./nfts.dto"
import { HoneycombService } from "@src/honeycomb"
import { UserLike } from "@src/jwt"
@Injectable()
export class NftsService {
    private readonly logger = new Logger(NftsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService
    ) {}

    async getSolanaMetaplexNft(
        { id }: UserLike,
        { nftAddress }: GetSolanaMetaplexNFTRequest
    ): Promise<GetSolanaMetaplexNFTResponse> {
        const { network } = await this.connection
            .model<UserSchema>(UserSchema.name)
            .findById(id)
        const asset = await this.honeycombService.edgeClients[network].findCharacters({
            mints: [nftAddress]
        })
        if (asset.character.length === 0) {
            return {
                data: {
                    status: MetaplexNFTStatus.Available
                },
                success: true,
                message: "NFT is available"
            }
        } else {
            return {
                data: {
                    status: MetaplexNFTStatus.Wrapped
                },
                success: true,
                message: "NFT is wrapped"
            }
        }
    }
}
