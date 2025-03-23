import { Logger, UseGuards } from "@nestjs/common"
import { ThiefPlantService } from "./thief-plant.service"
import { ThiefPlantRequest, ThiefPlantResponse } from "./thief-plant.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class ThiefPlantResolver {
    private readonly logger = new Logger(ThiefPlantResolver.name)

    constructor(private readonly thiefPlantService : ThiefPlantService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => ThiefPlantResponse, {
        name: "thiefPlant",
        description: "Thief plant",
    })
    public async thiefPlant(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ThiefPlantRequest
    ) {
        return this.thiefPlantService.thiefPlant(user, request)
    }
}
