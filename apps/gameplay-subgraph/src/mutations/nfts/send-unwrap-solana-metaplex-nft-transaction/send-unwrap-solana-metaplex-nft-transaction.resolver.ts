import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendUnwrapSolanaMetaplexNFTTransactionRequest,
    SendUnwrapSolanaMetaplexNFTTransactionResponse
} from "./send-unwrap-solana-metaplex-nft-transaction.dto"
import { SendUnwrapSolanaMetaplexNFTTransactionService } from "./send-unwrap-solana-metaplex-nft-transaction.service"

@Resolver()
export class SendUnwrapSolanaMetaplexNFTTransactionResolver {
    private readonly logger = new Logger(SendUnwrapSolanaMetaplexNFTTransactionResolver.name)
    constructor(
        private readonly sendUnwrapSolanaMetaplexNftTransactionService: SendUnwrapSolanaMetaplexNFTTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendUnwrapSolanaMetaplexNFTTransactionResponse, {
        name: "sendUnwrapSolanaMetaplexNFTTransaction",
        description: "Send Unwrap Solana Metaplex NFT Transaction"
    })
    public async sendUnwrapSolanaMetaplexNFTTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendUnwrapSolanaMetaplexNFTTransactionRequest
    ) {
        return this.sendUnwrapSolanaMetaplexNftTransactionService.sendUnwrapSolanaMetaplexNFTTransaction(
            user,
            request
        )
    }
}
