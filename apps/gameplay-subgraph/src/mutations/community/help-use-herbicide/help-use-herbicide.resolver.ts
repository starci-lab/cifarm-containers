import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { HelpUseHerbicideRequest } from "./help-use-herbicide.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUseHerbicideResolver {
    private readonly logger = new Logger(HelpUseHerbicideResolver.name)

    constructor(private readonly helpUseHerbicideService: HelpUseHerbicideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUseHerbicide",
        description: "Help use herbicide",
        nullable: true
    })
    public async helpUseHerbicide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseHerbicideRequest
    ) {
        return this.helpUseHerbicideService.helpUseHerbicide(user, request)
    }
}
