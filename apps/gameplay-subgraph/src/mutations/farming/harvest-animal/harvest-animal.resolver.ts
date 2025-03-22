import { Logger, UseGuards } from "@nestjs/common"
import { HarvestAnimalRequest, HarvestAnimalResponse } from "./harvest-animal.dto"
import { HarvestAnimalService } from "./harvest-animal.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class HarvestAnimalResolver {
    private readonly logger = new Logger(HarvestAnimalResolver.name)

    constructor(private readonly harvestAnimalService: HarvestAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => HarvestAnimalResponse, { name: "harvestAnimal", description: "Harvest an animal" })
    public async harvestAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HarvestAnimalRequest
    ) {
        return await this.harvestAnimalService.harvestAnimal(user, request)
    }
}
