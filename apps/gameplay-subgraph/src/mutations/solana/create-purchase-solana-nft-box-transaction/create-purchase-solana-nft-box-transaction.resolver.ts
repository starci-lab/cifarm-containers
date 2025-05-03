import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreatePurchaseSolanaNFTBoxTransactionService } from "./create-purchase-solana-nft-box-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { CreatePurchaseSolanaNFTBoxTransactionResponse } from "./create-purchase-solana-nft-box-transaction.dto"

@Resolver()
export class CreatePurchaseSolanaNFTBoxTransactionResolver {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTBoxTransactionResolver.name)
    constructor(
        private readonly createPurchaseSolanaNftBoxTransactionService: CreatePurchaseSolanaNFTBoxTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreatePurchaseSolanaNFTBoxTransactionResponse, {
        name: "createPurchaseSolanaNFTBoxTransaction",
        description: "Create Purchase Solana NFT Box Transaction"
    })
    public async createPurchaseSolanaNFTBoxTransaction(@GraphQLUser() user: UserLike) {
        return this.createPurchaseSolanaNftBoxTransactionService.createPurchaseSolanaNFTBoxTransaction(
            user
        )
    }
}
