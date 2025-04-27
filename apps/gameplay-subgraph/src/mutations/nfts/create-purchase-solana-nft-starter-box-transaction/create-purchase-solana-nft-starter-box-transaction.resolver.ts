import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreatePurchaseSolanaNFTStarterBoxTransactionService } from "./create-purchase-solana-nft-starter-box-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { CreatePurchaseSolanaNFTStarterBoxTransactionResponse } from "./create-purchase-solana-nft-starter-box-transaction.dto"

@Resolver()
export class CreatePurchaseSolanaNFTStarterBoxTransactionResolver {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTStarterBoxTransactionResolver.name)
    constructor(
        private readonly createPurchaseSolanaNftStarterBoxTransactionService: CreatePurchaseSolanaNFTStarterBoxTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreatePurchaseSolanaNFTStarterBoxTransactionResponse, {
        name: "createPurchaseSolanaNFTStarterBoxTransaction",
        description: "Create Purchase Solana NFT Starter Box Transaction"
    })
    public async createPurchaseSolanaNFTStarterBoxTransaction(@GraphQLUser() user: UserLike) {
        return this.createPurchaseSolanaNftStarterBoxTransactionService.createPurchaseSolanaNFTStarterBoxTransaction(
            user
        )
    }
}
