import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { HarvestPlantRequest, HarvestPlantResponse } from "./harvest-plant.dto"
import { HarvestPlantService } from "./harvest-plant.service"


@Resolver()
export class HarvestPlantResolver {
    private readonly logger = new Logger(HarvestPlantResolver.name)

    constructor(private readonly harvestPlantService: HarvestPlantService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => HarvestPlantResponse, { name: "harvestPlant" })
    public async harvestPlant(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HarvestPlantRequest
    ) {
        return this.harvestPlantService.harvestPlant(user, request)
    }
}
