import { Logger, UseGuards } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { BlockchainService } from "./blockchain.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { GetBlockchainBalancesRequest, GetBlockchainBalancesResponse, GetBlockchainCollectionsRequest, GetBlockchainCollectionsResponse } from "./blockchain.dto"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class BlockchainResolver {
    private readonly logger = new Logger(BlockchainResolver.name)

    constructor(private readonly blockchainService: BlockchainService) { }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => GetBlockchainBalancesResponse, {
        name: "blockchainBalances",
        description: "Get blockchain balances"
    })
    async blockchainBalances(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetBlockchainBalancesRequest
    ): Promise<GetBlockchainBalancesResponse> {
        return await this.blockchainService.blockchainBalances(request, user)
    }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => GetBlockchainCollectionsResponse, {
        name: "blockchainCollections",
        description: "Get blockchain collections"
    })
    async blockchainCollections(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetBlockchainCollectionsRequest
    ): Promise<GetBlockchainCollectionsResponse> {
        return await this.blockchainService.blockchainCollections(request, user)
    }
}
