import { Logger, UseGuards } from "@nestjs/common"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuySuppliesResolver {
    private readonly logger = new Logger(BuySuppliesResolver.name)

    constructor(private readonly buySupplyService: BuySuppliesService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buySupplies",
        description: "Buy supplies",
        nullable: true
    })
    public async buySupplies(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuySuppliesRequest
    ) {
        return this.buySupplyService.buySupplies(user, request)
    }
}
