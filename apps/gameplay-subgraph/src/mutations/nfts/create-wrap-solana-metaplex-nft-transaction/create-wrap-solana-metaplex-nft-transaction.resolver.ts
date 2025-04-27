import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { CreateWrapSolanaMetaplexNFTTransactionService } from "./create-wrap-solana-metaplex-nft-transaction.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { CreateWrapSolanaMetaplexNFTTransactionRequest, CreateWrapSolanaMetaplexNFTTransactionResponse } from "./create-wrap-solana-metaplex-nft-transaction.dto"

@Resolver()
export class CreateWrapSolanaMetaplexNFTTransactionResolver {
    private readonly logger = new Logger(CreateWrapSolanaMetaplexNFTTransactionResolver.name)
    constructor(
        private readonly createWrapSolanaMetaplexNFTTransactionService: CreateWrapSolanaMetaplexNFTTransactionService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateWrapSolanaMetaplexNFTTransactionResponse, {
        name: "createWrapSolanaMetaplexNFTTransaction",
        description: "Create Wrap Solana Metaplex NFT Transaction"
    })
    public async createWrapSolanaMetaplexNFTTransaction(@GraphQLUser() user: UserLike, @Args("request") request: CreateWrapSolanaMetaplexNFTTransactionRequest) {
        return this.createWrapSolanaMetaplexNFTTransactionService.createWrapSolanaMetaplexNFTTransaction(
            user,
            request
        )
    }
}
