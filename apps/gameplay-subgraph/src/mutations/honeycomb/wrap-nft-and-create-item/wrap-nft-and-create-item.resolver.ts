import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { WrapNFTAndCreateItemService } from "./wrap-nft-and-create-item.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { WrapNFTAndCreateItemRequest, WrapNFTAndCreateItemResponse } from "./wrap-nft-and-create-item.dto"

@Resolver()
export class WrapNFTAndCreateItemResolver {
    private readonly logger = new Logger(WrapNFTAndCreateItemResolver.name)

    constructor(private readonly wrapNFTAndCreateItemService: WrapNFTAndCreateItemService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => WrapNFTAndCreateItemResponse, {
        name: "wrapNFTAndCreateItem",
        description: "Wrap NFT and create item",
        nullable: true
    })
    public async wrapNFTAndCreateItem(
        @GraphQLUser() user: UserLike,
        @Args("request") request: WrapNFTAndCreateItemRequest
    ) {
        return this.wrapNFTAndCreateItemService.wrapNftAndCreateItemService(user, request)
    }
}
