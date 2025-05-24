import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateBuyEnergySolanaTransactionService } from "./create-buy-energy-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreateBuyEnergySolanaTransactionRequest,
    CreateBuyEnergySolanaTransactionResponse
} from "./create-buy-energy-solana-transaction.dto"

@Resolver()
export class CreateBuyEnergySolanaTransactionResolver {
    private readonly logger = new Logger(CreateBuyEnergySolanaTransactionResolver.name)
    constructor(
        private readonly createBuyEnergySolanaTransactionService: CreateBuyEnergySolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateBuyEnergySolanaTransactionResponse, {
        name: "createBuyEnergySolanaTransaction",
        description: "Create Buy Energy Solana Transaction"
    })
    public async createBuyEnergySolanaTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateBuyEnergySolanaTransactionRequest
    ) {
        return this.createBuyEnergySolanaTransactionService.createBuyEnergySolanaTransaction(
            user,
            request
        )
    }
}
