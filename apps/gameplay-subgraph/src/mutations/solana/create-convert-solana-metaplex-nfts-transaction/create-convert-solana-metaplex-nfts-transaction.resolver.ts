import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateConvertSolanaMetaplexNFTsTransactionService } from "./create-convert-solana-metaplex-nfts-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    CreateConvertSolanaMetaplexNFTsTransactionRequest,
    CreateConvertSolanaMetaplexNFTsTransactionResponse
} from "./create-convert-solana-metaplex-nfts-transaction.dto"

@Resolver()
export class CreateConvertSolanaMetaplexNFTsTransactionResolver {
    private readonly logger = new Logger(CreateConvertSolanaMetaplexNFTsTransactionResolver.name)
    constructor(
        private readonly createConvertSolanaMetaplexNFTsTransactionService: CreateConvertSolanaMetaplexNFTsTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateConvertSolanaMetaplexNFTsTransactionResponse, {
        name: "createConvertSolanaMetaplexNFTsTransaction",
        description: "Create Convert Solana Metaplex NFTs Transaction"
    })
    public async createConvertSolanaMetaplexNFTsTransaction(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CreateConvertSolanaMetaplexNFTsTransactionRequest
    ) {
        return this.createConvertSolanaMetaplexNFTsTransactionService.createConvertSolanaMetaplexNFTsTransaction(
            user,
            request
        )
    }
}
