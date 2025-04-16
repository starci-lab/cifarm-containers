import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTMetadataSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"
import { NFTsValidatedRequest, NFTValidated } from "./nft-metadatas.dto"

@Injectable()
export class NFTMetadatasService {
    private readonly logger = new Logger(NFTMetadatasService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async nftMetadata(id: string, { id: userId }: UserLike): Promise<NFTMetadataSchema> {
        const nftMetadata = await this.connection
            .model<NFTMetadataSchema>(NFTMetadataSchema.name)
            .findById(id)
        if (!nftMetadata) {
            throw new GraphQLError("NFT metadata not found", {
                extensions: {
                    code: "NOT_FOUND"
                }
            })
        }
        if (nftMetadata.user.toString() !== userId) {
            throw new GraphQLError("You are not allowed to access this NFT metadata", {
                extensions: {
                    code: "FORBIDDEN"
                }
            })
        }
        return nftMetadata
    }

    async nftMetadatas({ id: userId }: UserLike): Promise<Array<NFTMetadataSchema>> {
        return await this.connection
            .model<NFTMetadataSchema>(NFTMetadataSchema.name)
            .find({ user: userId })
    }

    async nftsValidated(
        request: NFTsValidatedRequest,
        { id: userId }: UserLike
    ): Promise<Array<NFTValidated>> {
        const nftsValidated = await this.connection
            .model<NFTMetadataSchema>(NFTMetadataSchema.name)
            .find({ user: userId, nftAddress: { $in: request.nftAddresses } })
        return request.nftAddresses.map((nftAddress) => ({
            nftAddress,
            validated: nftsValidated.some((nftMetadata) => nftMetadata.nftAddress === nftAddress && nftMetadata.validated)
        }))
    }
}
