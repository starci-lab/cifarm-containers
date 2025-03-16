import { Logger } from "@nestjs/common"
import { BuyBuildingService } from "./buy-building.service"
import { BuyBuildingRequest } from "./buy-building.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { VoidResolver } from "graphql-scalars"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class BuyBuildingResolver {
    private readonly logger = new Logger(BuyBuildingResolver.name)

    constructor(private readonly buyBuildingService: BuyBuildingService) {}

    @Mutation(() => VoidResolver, {
        name: "buyBuilding",
        description: "Buy a building",
        nullable: true
    })
    public async buyBuilding(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyBuildingRequest
    ) {
        return await this.buyBuildingService.buyBuilding(user, request)
    }
}
