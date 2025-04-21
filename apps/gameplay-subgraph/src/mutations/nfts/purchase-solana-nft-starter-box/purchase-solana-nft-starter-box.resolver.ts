import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { PurchaseSolanaNFTStarterBoxService } from "./purchase-solana-nft-starter-box.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { PurchaseSolanaNFTStarterBoxResponse } from "./purchase-solana-nft-starter-box.dto"
@Resolver()
export class PurchaseSolanaNFTStarterBoxResolver {
    private readonly logger = new Logger(PurchaseSolanaNFTStarterBoxResolver.name)
    constructor(private readonly purchaseSolanaNftStarterBoxService: PurchaseSolanaNFTStarterBoxService) {}
    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => PurchaseSolanaNFTStarterBoxResponse, {
        name: "purchaseSolanaNFTStarterBox",
        description: "Purchase Solana NFT Starter Box",
    })
    public async purchaseSolanaNFTStarterBox(
        @GraphQLUser() user: UserLike
    ) {
        return this.purchaseSolanaNftStarterBoxService.purchaseSolanaNFTStarterBox(user)
    }
}
