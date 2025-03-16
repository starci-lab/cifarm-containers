import { Logger, UseGuards } from "@nestjs/common"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import { HelpUsePesticideRequest } from "./help-use-pesticide.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUsePesticideResolver {
    private readonly logger = new Logger(HelpUsePesticideResolver.name)

    constructor(private readonly helpUsePesticideService: HelpUsePesticideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUsePesticide",
        description: "Help use pesticide",
        nullable: true
    })
    public async helpUsePesticide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUsePesticideRequest
    ) {
        return this.helpUsePesticideService.helpUsePesticide(user, request)
    }
}
