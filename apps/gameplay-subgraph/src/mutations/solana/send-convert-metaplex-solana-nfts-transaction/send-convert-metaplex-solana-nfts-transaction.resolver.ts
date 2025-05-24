import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SendConvertSolanaMetaplexNFTsTransactionService } from "./send-convert-metaplex-solana-nfts-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    SendConvertSolanaMetaplexNFTsTransactionRequest,
    SendConvertSolanaMetaplexNFTsTransactionResponse
} from "./send-convert-metaplex-solana-nfts-transaction.dto"

@Resolver()
export class SendConvertSolanaMetaplexNFTsTransactionResolver {
    private readonly logger = new Logger(SendConvertSolanaMetaplexNFTsTransactionResolver.name)
    constructor(
        private readonly sendConvertSolanaMetaplexNFTsTransactionService: SendConvertSolanaMetaplexNFTsTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => SendConvertSolanaMetaplexNFTsTransactionResponse, {
        name: "sendConvertSolanaMetaplexNFTsTransaction",
        description: "Send Convert Solana Metaplex NFTs Transaction"
    })
    public async sendConvertSolanaMetaplexNFTsTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: SendConvertSolanaMetaplexNFTsTransactionRequest
    ) {
        return this.sendConvertSolanaMetaplexNFTsTransactionService.sendConvertSolanaMetaplexNFTsTransaction(
            user,
            request
        )
    }
}
