import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { WrapSolanaMetaplexNFTService } from "./wrap-solana-metaplex-nft.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { WrapSolanaMetaplexNFTRequest, WrapSolanaMetaplexNFTResponse } from "./wrap-solana-metaplex-nft.dto"

@Resolver()
export class WrapSolanaMetaplexNFTResolver {
    private readonly logger = new Logger(WrapSolanaMetaplexNFTResolver.name)
    constructor(private readonly wrapSolanaMetaplexNftService: WrapSolanaMetaplexNFTService) {}
    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => WrapSolanaMetaplexNFTResponse, {
        name: "wrapSolanaMetaplexNft",
        description: "Wrap Solana Metaplex NFT",
    })
    public async wrapSolanaMetaplexNft(
        @GraphQLUser() user: UserLike,
        @Args("request") request: WrapSolanaMetaplexNFTRequest
    ) {
        return this.wrapSolanaMetaplexNftService.wrapSolanaMetaplexNft(user, request)
    }
}
