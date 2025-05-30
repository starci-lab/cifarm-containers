import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendShipSolanaTransactionService } from "./send-ship-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { SendShipSolanaTransactionRequest, SendShipSolanaTransactionResponse } from "./send-ship-solana-transaction.dto"

@Resolver()
export class SendShipSolanaTransactionResolver {
    private readonly logger = new Logger(SendShipSolanaTransactionResolver.name)
    constructor(
        private readonly sendShipSolanaTransactionService: SendShipSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendShipSolanaTransactionResponse, {
        name: "sendShipSolanaTransaction",
        description: "Send Ship Solana Transaction"
    })
    public async sendShipSolanaTransaction(@GraphQLUser() user: UserLike,
        @Args("request") request: SendShipSolanaTransactionRequest
    ) {
        return this.sendShipSolanaTransactionService.sendShipSolanaTransaction(
            user,
            request
        )
    }
}
