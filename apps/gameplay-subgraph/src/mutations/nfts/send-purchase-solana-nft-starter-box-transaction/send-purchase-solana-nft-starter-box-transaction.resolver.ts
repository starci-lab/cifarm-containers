import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendPurchaseSolanaNFTStarterBoxTransactionService } from "./send-purchase-solana-nft-starter-box-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendPurchaseSolanaNFTStarterBoxTransactionRequest,
    SendPurchaseSolanaNFTStarterBoxTransactionResponse
} from "./send-purchase-solana-nft-starter-box-transaction.dto"

@Resolver()
export class SendPurchaseSolanaNFTStarterBoxTransactionResolver {
    private readonly logger = new Logger(SendPurchaseSolanaNFTStarterBoxTransactionResolver.name)
    constructor(
        private readonly sendPurchaseSolanaNftStarterBoxTransactionService: SendPurchaseSolanaNFTStarterBoxTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendPurchaseSolanaNFTStarterBoxTransactionResponse, {
        name: "sendPurchaseSolanaNFTStarterBoxTransaction",
        description: "Send Purchase Solana NFT Starter Box Transaction"
    })
    public async sendPurchaseSolanaNFTStarterBoxTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendPurchaseSolanaNFTStarterBoxTransactionRequest
    ) {
        return this.sendPurchaseSolanaNftStarterBoxTransactionService.sendPurchaseSolanaNFTStarterBoxTransaction(
            user,
            request
        )
    }
}
