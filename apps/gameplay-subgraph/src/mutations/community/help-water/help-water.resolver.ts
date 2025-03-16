import { Logger, UseGuards } from "@nestjs/common"
import { HelpWaterService } from "./help-water.service"
import { HelpWaterRequest } from "./help-water.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpWaterResolver {
    private readonly logger = new Logger(HelpWaterResolver.name)

    constructor(private readonly helpWaterService: HelpWaterService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpWater",
        description: "Help water a placed item",
        nullable: true
    })
    public async helpWater(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpWaterRequest
    ) {
        return this.helpWaterService.helpWater(user, request)
    }
}
