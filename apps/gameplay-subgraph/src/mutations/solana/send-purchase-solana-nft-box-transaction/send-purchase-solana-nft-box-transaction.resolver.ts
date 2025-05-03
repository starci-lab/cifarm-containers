import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendPurchaseSolanaNFTBoxTransactionService } from "./send-purchase-solana-nft-box-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendPurchaseSolanaNFTBoxTransactionRequest,
    SendPurchaseSolanaNFTBoxTransactionResponse
} from "./send-purchase-solana-nft-box-transaction.dto"

@Resolver()
export class SendPurchaseSolanaNFTBoxTransactionResolver {
    private readonly logger = new Logger(SendPurchaseSolanaNFTBoxTransactionResolver.name)
    constructor(
        private readonly sendPurchaseSolanaNftBoxTransactionService: SendPurchaseSolanaNFTBoxTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendPurchaseSolanaNFTBoxTransactionResponse, {
        name: "sendPurchaseSolanaNFTBoxTransaction",
        description: "Send Purchase Solana NFT Box Transaction"
    })
    public async sendPurchaseSolanaNFTBoxTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendPurchaseSolanaNFTBoxTransactionRequest
    ) {
        return this.sendPurchaseSolanaNftBoxTransactionService.sendPurchaseSolanaNFTBoxTransaction(
            user,
            request
        )
    }
}
