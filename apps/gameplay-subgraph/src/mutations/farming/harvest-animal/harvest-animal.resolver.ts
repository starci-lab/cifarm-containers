import { Logger, UseGuards } from "@nestjs/common"
import { HarvestAnimalRequest } from "./harvest-animal.dto"
import { HarvestAnimalService } from "./harvest-animal.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HarvestAnimalResolver {
    private readonly logger = new Logger(HarvestAnimalResolver.name)

    constructor(private readonly harvestAnimalService: HarvestAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "harvestAnimal", description: "Harvest an animal", nullable: true })
    public async harvestAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HarvestAnimalRequest
    ) {
        return await this.harvestAnimalService.harvestAnimal(user, request)
    }
}
