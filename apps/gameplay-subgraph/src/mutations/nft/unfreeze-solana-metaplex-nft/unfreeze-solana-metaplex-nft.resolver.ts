import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UnfreezeSolanaMetaplexNFTService } from "./unfreeze-solana-metaplex-nft.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { UnfreezeSolanaMetaplexNFTResponse, UnfreezeSolanaMetaplexNFTRequest } from "./unfreeze-solana-metaplex-nft.dto"
@Resolver()
export class UnfreezeSolanaMetaplexNFTResolver {
    private readonly logger = new Logger(UnfreezeSolanaMetaplexNFTResolver.name)
    constructor(private readonly unfreezeSolanaMetaplexNftService: UnfreezeSolanaMetaplexNFTService) {}
    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => UnfreezeSolanaMetaplexNFTResponse, {
        name: "unfreezeSolanaMetaplexNFT",
        description: "Unfreeze Solana Metaplex NFT",
    })
    public async unfreezeSolanaMetaplexNFT(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UnfreezeSolanaMetaplexNFTRequest
    ) {
        return this.unfreezeSolanaMetaplexNftService.unfreezeSolanaMetaplexNFT(user, request)
    }
}
