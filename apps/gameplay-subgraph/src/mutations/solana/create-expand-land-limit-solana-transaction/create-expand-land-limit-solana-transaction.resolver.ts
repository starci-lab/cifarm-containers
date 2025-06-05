import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateExpandLandLimitSolanaTransactionService } from "./create-expand-land-limit-solana-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreateExpandLandLimitSolanaTransactionRequest,
    CreateExpandLandLimitSolanaTransactionResponse
} from "./create-expand-land-limit-solana-transaction.dto"

@Resolver()
export class CreateExpandLandLimitSolanaTransactionResolver {
    private readonly logger = new Logger(CreateExpandLandLimitSolanaTransactionResolver.name)
    constructor(
        private readonly createExpandLandLimitSolanaTransactionService: CreateExpandLandLimitSolanaTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateExpandLandLimitSolanaTransactionResponse, {
        name: "createExpandLandLimitSolanaTransaction",
        description: "Create Expand Land Limit Solana Transaction"
    })
    public async createExpandLandLimitSolanaTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateExpandLandLimitSolanaTransactionRequest
    ) {
        return this.createExpandLandLimitSolanaTransactionService.createExpandLandLimitSolanaTransaction(
            user,
            request
        )
    }
}
