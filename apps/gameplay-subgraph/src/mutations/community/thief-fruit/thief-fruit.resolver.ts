import { Logger, UseGuards } from "@nestjs/common"
import { ThiefFruitService } from "./thief-fruit.service"
import { ThiefFruitRequest, ThiefFruitResponse } from "./thief-fruit.dto"
import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class ThiefFruitController {
    private readonly logger = new Logger(ThiefFruitController.name)

    constructor(private readonly thiefFruitService: ThiefFruitService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => ThiefFruitResponse, { name: "thiefFruit" })
    public async thiefFruit(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ThiefFruitRequest
    ) {
        return this.thiefFruitService.thiefFruit(user, request)
    }
}
