import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { FreezeSolanaMetaplexNFTService } from "./freeze-solana-metaplex-nft.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { FreezeSolanaMetaplexNFTResponse, FreezeSolanaMetaplexNFTRequest } from "./freeze-solana-metaplex-nft.dto"
@Resolver()
export class FreezeSolanaMetaplexNFTResolver {
    private readonly logger = new Logger(FreezeSolanaMetaplexNFTResolver.name)
    constructor(private readonly freezeSolanaMetaplexNftService: FreezeSolanaMetaplexNFTService) {}
    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => FreezeSolanaMetaplexNFTResponse, {
        name: "freezeSolanaMetaplexNFT",
        description: "Freeze Solana Metaplex NFT",
    })
    public async freezeSolanaMetaplexNFT(
        @GraphQLUser() user: UserLike,
        @Args("request") request: FreezeSolanaMetaplexNFTRequest
    ) {
        return this.freezeSolanaMetaplexNftService.freezeSolanaMetaplexNFT(user, request)
    }
}
