import { Logger, UseGuards } from "@nestjs/common"
import { ShipWholesaleMarketService } from "./ship-wholesale-market.service"
import { ShipWholesaleMarketRequest, ShipWholesaleMarketResponse } from "./ship-wholesale-market.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class ShipWholesaleMarketResolver {
    private readonly logger = new Logger(ShipWholesaleMarketResolver.name)

    constructor(private readonly shipWholesaleMarketService: ShipWholesaleMarketService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => ShipWholesaleMarketResponse, {
        name: "shipWholesaleMarket",
        description: "Ship wholesale market",
        nullable: true
    })
    public async shipWholesaleMarket(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ShipWholesaleMarketRequest
    ) {
        return this.shipWholesaleMarketService.shipWholesaleMarket(user, request)
    }
}
