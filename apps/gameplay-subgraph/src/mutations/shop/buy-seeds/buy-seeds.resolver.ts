import { Logger, UseGuards } from "@nestjs/common"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsService } from "./buy-seeds.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuySeedsResolver {
    private readonly logger = new Logger(BuySeedsResolver.name)

    constructor(private readonly buySeedService: BuySeedsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buySeeds",
        description: "Buy seeds",
        nullable: true
    })
    public async buySeeds(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuySeedsRequest
    ) {
        return this.buySeedService.buySeeds(user, request)
    }
}
