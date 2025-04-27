import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendWrapSolanaMetaplexNFTTransactionService } from "./send-wrap-solana-metaplex-nft-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendWrapSolanaMetaplexNFTTransactionRequest,
    SendWrapSolanaMetaplexNFTTransactionResponse
} from "./send-wrap-solana-metaplex-nft-transaction.dto"

@Resolver()
export class SendWrapSolanaMetaplexNFTTransactionResolver {
    private readonly logger = new Logger(SendWrapSolanaMetaplexNFTTransactionResolver.name)
    constructor(
        private readonly sendWrapSolanaMetaplexNFTTransactionService: SendWrapSolanaMetaplexNFTTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendWrapSolanaMetaplexNFTTransactionResponse, {
        name: "sendWrapSolanaMetaplexNFTTransaction",
        description: "Send Wrap Solana Metaplex NFT Transaction"
    })
    public async sendWrapSolanaMetaplexNFTTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendWrapSolanaMetaplexNFTTransactionRequest
    ) {
        return this.sendWrapSolanaMetaplexNFTTransactionService.sendWrapSolanaMetaplexNFTTransaction(
            user,
            request
        )
    }
}
