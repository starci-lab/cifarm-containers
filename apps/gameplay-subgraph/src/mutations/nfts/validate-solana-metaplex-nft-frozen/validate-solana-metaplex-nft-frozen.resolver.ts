import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { ValidateSolanaMetaplexNFTFrozenService } from "./validate-solana-metaplex-nft-frozen.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { ValidateSolanaMetaplexNFTFrozenResponse, ValidateSolanaMetaplexNFTFrozenRequest } from "./validate-solana-metaplex-nft-frozen.dto"
@Resolver()
export class ValidateSolanaMetaplexNFTFrozenResolver {
    private readonly logger = new Logger(ValidateSolanaMetaplexNFTFrozenResolver.name)
    constructor(private readonly validateSolanaMetaplexNftService: ValidateSolanaMetaplexNFTFrozenService) {}
    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => ValidateSolanaMetaplexNFTFrozenResponse, {
        name: "validateSolanaMetaplexNFTFrozen",
        description: "Validate Solana Metaplex NFT frozen",
    })
    public async validateSolanaMetaplexNFTFrozen(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ValidateSolanaMetaplexNFTFrozenRequest
    ) {
        return this.validateSolanaMetaplexNftService.validateSolanaMetaplexNFTFrozen(user, request)
    }
}
