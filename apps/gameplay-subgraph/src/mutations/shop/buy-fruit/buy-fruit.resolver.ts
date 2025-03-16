import { Logger, UseGuards } from "@nestjs/common"
import { BuyFruitService } from "./buy-fruit.service"
import { BuyFruitRequest } from "./buy-fruit.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class BuyFruitResolver {
    private readonly logger = new Logger(BuyFruitResolver.name)

    constructor(private readonly buyFruitService: BuyFruitService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "buyFruit" })
    public async buyFruit(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyFruitRequest
    ): Promise<EmptyObjectType> {
        return await this.buyFruitService.buyFruit(user, request)
    }
}
