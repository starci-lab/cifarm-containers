import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreateUnwrapSolanaMetaplexNFTTransactionRequest,
    CreateUnwrapSolanaMetaplexNFTTransactionResponse
} from "./create-unwrap-solana-metaplex-nft-transaction.dto"
import { CreateUnwrapSolanaMetaplexNFTTransactionService } from "./create-unwrap-solana-metaplex-nft-transaction.service"

@Resolver()
export class CreateUnwrapSolanaMetaplexNFTTransactionResolver {
    private readonly logger = new Logger(CreateUnwrapSolanaMetaplexNFTTransactionResolver.name)
    constructor(
        private readonly createUnwrapSolanaMetaplexNFTTransactionService: CreateUnwrapSolanaMetaplexNFTTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateUnwrapSolanaMetaplexNFTTransactionResponse, {
        name: "createUnwrapSolanaMetaplexNFTTransaction",
        description: "Create Unwrap Solana Metaplex NFT Transaction"
    })
    public async createUnwrapSolanaMetaplexNFTTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateUnwrapSolanaMetaplexNFTTransactionRequest
    ) {
        return this.createUnwrapSolanaMetaplexNFTTransactionService.createUnwrapSolanaMetaplexNFTTransaction(
            user,
            request
        )
    }
}
