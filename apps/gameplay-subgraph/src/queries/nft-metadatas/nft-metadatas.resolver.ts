import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { NFTMetadatasService } from "./nft-metadatas.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { NFTMetadataSchema } from "@src/databases"
import { NFTValidated, NFTsValidatedRequest } from "./nft-metadatas.dto"

@Resolver()
export class NFTMetadatasResolver {
    private readonly logger = new Logger(NFTMetadatasResolver.name)

    constructor(private readonly nftMetadatasService: NFTMetadatasService) {}

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => NFTMetadataSchema, {
        name: "nftMetadata",
        description: "Get nft metadata"
    })
    async nftMetadata(
        @GraphQLUser() user: UserLike,
        @Args("id", { type: () => ID, description: "The ID of the nft metadata" }) id: string
    ): Promise<NFTMetadataSchema> {
        return await this.nftMetadatasService.nftMetadata(id, user)
    }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => [NFTMetadataSchema], {
        name: "nftMetadatas",
        description: "Get all nft metadata"
    })
    async nftMetadatas(@GraphQLUser() user: UserLike): Promise<Array<NFTMetadataSchema>> {
        return await this.nftMetadatasService.nftMetadatas(user)
    }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => [NFTValidated], {
        name: "nftsValidated",
        description: "Get nft validated"
    })
    async nftsValidated(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => NFTsValidatedRequest }) request: NFTsValidatedRequest
    ): Promise<Array<NFTValidated>> {
        return await this.nftMetadatasService.nftsValidated(request, user)
    }
}
