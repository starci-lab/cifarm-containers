import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateBuyGoldsSolanaTransactionService } from "./create-buy-golds-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreateBuyGoldsSolanaTransactionRequest,
    CreateBuyGoldsSolanaTransactionResponse
} from "./create-buy-golds-solana-transaction.dto"

@Resolver()
export class CreateBuyGoldsSolanaTransactionResolver {
    private readonly logger = new Logger(CreateBuyGoldsSolanaTransactionResolver.name)
    constructor(
        private readonly createBuyGoldsSolanaTransactionService: CreateBuyGoldsSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateBuyGoldsSolanaTransactionResponse, {
        name: "createBuyGoldsSolanaTransaction",
        description: "Create Buy Golds Solana Transaction"
    })
    public async createBuyGoldsSolanaTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateBuyGoldsSolanaTransactionRequest
    ) {
        return this.createBuyGoldsSolanaTransactionService.createBuyGoldsSolanaTransaction(
            user,
            request
        )
    }
}
