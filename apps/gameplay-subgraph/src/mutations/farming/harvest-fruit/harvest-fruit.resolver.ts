import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { HarvestFruitRequest, HarvestFruitResponse } from "./harvest-fruit.dto"
import { HarvestFruitService } from "./harvest-fruit.service"

@Resolver()
export class HarvestFruitResolver {
    private readonly logger = new Logger(HarvestFruitResolver.name)

    constructor(private readonly harvestFruitService: HarvestFruitService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => HarvestFruitResponse, { name: "harvestFruit" })
    public async harvestFruit(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HarvestFruitRequest
    ) {
        return this.harvestFruitService.harvestFruit(user, request)
    }
}
