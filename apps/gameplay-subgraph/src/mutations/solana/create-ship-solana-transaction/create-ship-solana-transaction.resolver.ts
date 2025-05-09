import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateShipSolanaTransactionService } from "./create-ship-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { CreateShipSolanaTransactionRequest, CreateShipSolanaTransactionResponse } from "./create-ship-solana-transaction.dto"

@Resolver()
export class CreateShipSolanaTransactionResolver {
    private readonly logger = new Logger(CreateShipSolanaTransactionResolver.name)
    constructor(
        private readonly createShipSolanaTransactionService: CreateShipSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateShipSolanaTransactionResponse, {
        name: "createShipSolanaTransaction",
        description: "Create Ship Solana Transaction"
    })
    public async createShipSolanaTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateShipSolanaTransactionRequest
    ) {
        return this.createShipSolanaTransactionService.createShipSolanaTransaction(
            user,
            request
        )
    }
}
