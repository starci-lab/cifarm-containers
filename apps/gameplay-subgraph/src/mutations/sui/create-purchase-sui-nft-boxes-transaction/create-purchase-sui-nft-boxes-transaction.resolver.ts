import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreatePurchaseSuiNFTBoxesTransactionService } from "./create-purchase-sui-nft-boxes-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreatePurchaseSuiNFTBoxesTransactionRequest,
    CreatePurchaseSuiNFTBoxesTransactionResponse
} from "./create-purchase-sui-nft-boxes-transaction.dto"

@Resolver()
export class CreatePurchaseSuiNFTBoxesTransactionResolver {
    private readonly logger = new Logger(CreatePurchaseSuiNFTBoxesTransactionResolver.name)
    constructor(
        private readonly createPurchaseSuiNftBoxesTransactionService: CreatePurchaseSuiNFTBoxesTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreatePurchaseSuiNFTBoxesTransactionResponse, {
        name: "createPurchaseSuiNFTBoxesTransaction",
        description: "Create Purchase Sui NFT Boxes Transaction"
    })
    public async createPurchaseSuiNFTBoxesTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreatePurchaseSuiNFTBoxesTransactionRequest
    ) {
        return this.createPurchaseSuiNftBoxesTransactionService.createPurchaseSuiNFTBoxesTransaction(
            user,
            request
        )
    }
}