import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreatePurchaseSolanaNFTBoxesTransactionService } from "./create-purchase-solana-nft-boxes-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreatePurchaseSolanaNFTBoxesTransactionRequest,
    CreatePurchaseSolanaNFTBoxesTransactionResponse
} from "./create-purchase-solana-nft-boxes-transaction.dto"

@Resolver()
export class CreatePurchaseSolanaNFTBoxesTransactionResolver {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTBoxesTransactionResolver.name)
    constructor(
        private readonly createPurchaseSolanaNftBoxesTransactionService: CreatePurchaseSolanaNFTBoxesTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreatePurchaseSolanaNFTBoxesTransactionResponse, {
        name: "createPurchaseSolanaNFTBoxesTransaction",
        description: "Create Purchase Solana NFT Boxes Transaction"
    })
    public async createPurchaseSolanaNFTBoxesTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreatePurchaseSolanaNFTBoxesTransactionRequest
    ) {
        return this.createPurchaseSolanaNftBoxesTransactionService.createPurchaseSolanaNFTBoxesTransaction(
            user,
            request
        )
    }
}
