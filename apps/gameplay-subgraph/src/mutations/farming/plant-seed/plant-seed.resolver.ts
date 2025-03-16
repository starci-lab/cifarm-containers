import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { PlantSeedService } from "./plant-seed.service"
import { PlantSeedRequest } from "./plant-seed.dto"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class PlantSeedResolver {
    private readonly logger = new Logger(PlantSeedResolver.name)

    constructor(private readonly plantSeedService: PlantSeedService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "plantSeed" })
    public async plantSeed(
        @GraphQLUser() user: UserLike,
        @Args("request") request: PlantSeedRequest
    ) {
        return this.plantSeedService.plantSeed(user, request)
    }
}
