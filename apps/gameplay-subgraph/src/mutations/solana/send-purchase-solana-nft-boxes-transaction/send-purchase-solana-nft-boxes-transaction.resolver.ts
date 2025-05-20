import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendPurchaseSolanaNFTBoxesTransactionService } from "./send-purchase-solana-nft-boxes-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendPurchaseSolanaNFTBoxesTransactionRequest,
    SendPurchaseSolanaNFTBoxesTransactionResponse
} from "./send-purchase-solana-nft-boxes-transaction.dto"

@Resolver()
export class SendPurchaseSolanaNFTBoxesTransactionResolver {
    private readonly logger = new Logger(SendPurchaseSolanaNFTBoxesTransactionResolver.name)
    constructor(
        private readonly sendPurchaseSolanaNftBoxesTransactionService: SendPurchaseSolanaNFTBoxesTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendPurchaseSolanaNFTBoxesTransactionResponse, {
        name: "sendPurchaseSolanaNFTBoxesTransaction",
        description: "Send Purchase Solana NFT Box Transaction"
    })
    public async sendPurchaseSolanaNFTBoxesTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendPurchaseSolanaNFTBoxesTransactionRequest
    ) {
        return this.sendPurchaseSolanaNftBoxesTransactionService.sendPurchaseSolanaNFTBoxesTransaction(
            user,
            request
        )
    }
}
