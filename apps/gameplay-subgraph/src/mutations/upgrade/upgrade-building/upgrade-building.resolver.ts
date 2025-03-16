import { Logger, UseGuards } from "@nestjs/common"
import { UpgradeBuildingRequest } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UpgradeBuildingResolver {
    private readonly logger = new Logger(UpgradeBuildingResolver.name)

    constructor(private readonly UpgradeBuildingService: UpgradeBuildingService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "upgradeBuilding", description: "Upgrade a building", nullable: true })
    public async upgradeBuilding(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UpgradeBuildingRequest
    ) {
        return await this.UpgradeBuildingService.upgradeBuilding(user, request)
    }
}
