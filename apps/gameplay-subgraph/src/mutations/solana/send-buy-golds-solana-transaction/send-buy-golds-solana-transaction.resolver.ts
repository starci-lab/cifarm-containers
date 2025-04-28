import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendBuyGoldsSolanaTransactionService } from "./send-buy-golds-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { SendBuyGoldsSolanaTransactionRequest, SendBuyGoldsSolanaTransactionResponse } from "./send-buy-golds-solana-transaction.dto"

@Resolver()
export class SendBuyGoldsSolanaTransactionResolver {
    private readonly logger = new Logger(SendBuyGoldsSolanaTransactionResolver.name)
    constructor(
        private readonly sendBuyGoldsSolanaTransactionService: SendBuyGoldsSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendBuyGoldsSolanaTransactionResponse, {
        name: "sendBuyGoldsSolanaTransaction",
        description: "Send Buy Golds Solana Transaction"
    })
    public async sendBuyGoldsSolanaTransaction(@GraphQLUser() user: UserLike,
        @Args("request") request: SendBuyGoldsSolanaTransactionRequest
    ) {
        return this.sendBuyGoldsSolanaTransactionService.sendBuyGoldsSolanaTransaction(
            user,
            request
        )
    }
}
