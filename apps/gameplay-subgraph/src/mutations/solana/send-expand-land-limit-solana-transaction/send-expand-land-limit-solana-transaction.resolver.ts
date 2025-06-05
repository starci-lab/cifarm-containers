import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendExpandLandLimitSolanaTransactionService } from "./send-expand-land-limit-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { SendExpandLandLimitSolanaTransactionRequest, SendExpandLandLimitSolanaTransactionResponse } from "./send-expand-land-limit-solana-transaction.dto"

@Resolver()
export class SendExpandLandLimitSolanaTransactionResolver {
    private readonly logger = new Logger(SendExpandLandLimitSolanaTransactionResolver.name)
    constructor(
        private readonly sendExpandLandLimitSolanaTransactionService: SendExpandLandLimitSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendExpandLandLimitSolanaTransactionResponse, {
        name: "sendExpandLandLimitSolanaTransaction",
        description: "Send Expand Land Limit Solana Transaction"
    })
    public async sendExpandLandLimitSolanaTransaction(@GraphQLUser() user: UserLike,
        @Args("request") request: SendExpandLandLimitSolanaTransactionRequest
    ) {
        return this.sendExpandLandLimitSolanaTransactionService.sendExpandLandLimitSolanaTransaction(
            user,
            request
        )
    }
}
