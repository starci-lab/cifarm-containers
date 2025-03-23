import { Logger, UseGuards } from "@nestjs/common"
import { BuyFlowerSeedsRequest } from "./buy-flower-seeds.dto"
import { BuyFlowerSeedsService } from "./buy-flower-seeds.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyFlowerSeedsResolver {
    private readonly logger = new Logger(BuyFlowerSeedsResolver.name)

    constructor(private readonly buyFlowerSeedsService: BuyFlowerSeedsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyFlowerSeeds",
        description: "Buy flower seeds",
        nullable: true
    })
    public async buyFlowerSeeds(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyFlowerSeedsRequest
    ) {
        return this.buyFlowerSeedsService.buyFlowerSeeds(user, request)
    }
}
