import { Logger, UseGuards } from "@nestjs/common"
import { BuyFruitService } from "./buy-fruit.service"
import { BuyFruitRequest } from "./buy-fruit.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyFruitResolver {
    private readonly logger = new Logger(BuyFruitResolver.name)

    constructor(private readonly buyFruitService: BuyFruitService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyFruit",
        description: "Buy a fruit",
        nullable: true
    })
    public async buyFruit(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyFruitRequest
    ) {
        return await this.buyFruitService.buyFruit(user, request)
    }
}
