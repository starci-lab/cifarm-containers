import { Logger, UseGuards } from "@nestjs/common"
import { BuyCropSeedsRequest } from "./buy-crop-seeds.dto"
import { BuyCropSeedsService } from "./buy-crop-seeds.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyCropSeedsResolver {
    private readonly logger = new Logger(BuyCropSeedsResolver.name)

    constructor(private readonly buyCropSeedsService: BuyCropSeedsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyCropSeeds",
        description: "Buy crop seeds",
        nullable: true
    })
    public async buyCropSeeds(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyCropSeedsRequest
    ) {
        return this.buyCropSeedsService.buyCropSeeds(user, request)
    }
}
