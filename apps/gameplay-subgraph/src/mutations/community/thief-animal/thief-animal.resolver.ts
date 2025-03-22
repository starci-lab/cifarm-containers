import { Logger, UseGuards } from "@nestjs/common"
import { ThiefAnimalService } from "./thief-animal.service"
import { ThiefAnimalRequest, ThiefAnimalResponse } from "./thief-animal.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"

@Resolver()
export class ThiefAnimalResolver {
    private readonly logger = new Logger(ThiefAnimalResolver.name)

    constructor(private readonly thiefAnimalService: ThiefAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => ThiefAnimalResponse, {
        name: "thiefAnimal",
        description: "Thief animal"
    })
    public async thiefAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ThiefAnimalRequest
    ) {
        return this.thiefAnimalService.thiefAnimal(user, request)
    }
}
