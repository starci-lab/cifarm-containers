import { Logger, UseGuards } from "@nestjs/common"
import { UpgradeBuildingRequest } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { EmptyObjectType } from "@src/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class UpgradeBuildingResolver {
    private readonly logger = new Logger(UpgradeBuildingResolver.name)

    constructor(private readonly UpgradeBuildingService: UpgradeBuildingService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "upgradeBuilding" })
    public async upgradeBuilding(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UpgradeBuildingRequest
    ): Promise<EmptyObjectType> {
        return await this.UpgradeBuildingService.upgradeBuilding(user, request)
    }
}
