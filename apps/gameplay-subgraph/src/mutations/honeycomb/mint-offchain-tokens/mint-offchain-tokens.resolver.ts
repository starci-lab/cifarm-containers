import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { MintOffchainTokensRequest } from "./mint-offchain-tokens.dto"
import { MintOffchainTokensService } from "./mint-offchain-tokens.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { MintOffchainTokensResponse } from "./mint-offchain-tokens.dto"

@Resolver()
export class MintOffchainTokensResolver {
    private readonly logger = new Logger(MintOffchainTokensResolver.name)

    constructor(private readonly mintOffchainTokensService: MintOffchainTokensService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => MintOffchainTokensResponse, {
        name: "mintOffchainTokens",
        description: "Mint offchain tokens",
        nullable: true
    })
    public async mintOffchainTokens(
        @GraphQLUser() user: UserLike,
        @Args("request") request: MintOffchainTokensRequest
    ) {
        return this.mintOffchainTokensService.mintOffchainTokensService(user, request)
    }
}
