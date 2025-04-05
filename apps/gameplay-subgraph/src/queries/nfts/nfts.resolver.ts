import { Logger, UseGuards } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { NftsService } from "./nfts.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { GetSolanaMetaplexNFTResponse, GetSolanaMetaplexNFTRequest } from "./nfts.dto"

@Resolver()
export class NftsResolver {
    private readonly logger = new Logger(NftsResolver.name)

    constructor(private readonly nftsService: NftsService) {}

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => GetSolanaMetaplexNFTResponse, {
        name: "solanaMetaplexNft",
        description: "Get solana metaplex nft"
    })
    async getSolanaMetaplexNft(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetSolanaMetaplexNFTRequest
    ): Promise<GetSolanaMetaplexNFTResponse> {
        return await this.nftsService.getSolanaMetaplexNft(user, request)
    }
}
