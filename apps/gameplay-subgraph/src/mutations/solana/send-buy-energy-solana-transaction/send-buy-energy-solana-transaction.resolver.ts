import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendBuyEnergySolanaTransactionService } from "./send-buy-energy-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendBuyEnergySolanaTransactionRequest   ,
    SendBuyEnergySolanaTransactionResponse    
} from "./send-buy-energy-solana-transaction.dto"

@Resolver()
export class SendBuyEnergySolanaTransactionResolver {
    private readonly logger = new Logger(SendBuyEnergySolanaTransactionResolver.name)
    constructor(
        private readonly sendBuyEnergySolanaTransactionService: SendBuyEnergySolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendBuyEnergySolanaTransactionResponse, {
        name: "sendBuyEnergySolanaTransaction",
        description: "Send Buy Energy Solana Transaction"
    })
    public async sendBuyEnergySolanaTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendBuyEnergySolanaTransactionRequest
    ) {
        return this.sendBuyEnergySolanaTransactionService.sendBuyEnergySolanaTransaction(
            user,
            request
        )
    }
}
