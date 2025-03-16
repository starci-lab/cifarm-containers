import { Logger, UseGuards } from "@nestjs/common"
import { HelpWaterService } from "./help-water.service"
import { HelpWaterRequest } from "./help-water.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class HelpWaterResolver {
    private readonly logger = new Logger(HelpWaterResolver.name)

    constructor(private readonly helpWaterService: HelpWaterService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "helpWater" })
    public async helpWater(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpWaterRequest
    ) {
        return this.helpWaterService.helpWater(user, request)
    }
}
