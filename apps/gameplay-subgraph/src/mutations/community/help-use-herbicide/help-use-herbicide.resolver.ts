import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { HelpUseHerbicideRequest } from "./help-use-herbicide.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class HelpUseHerbicideResolver {
    private readonly logger = new Logger(HelpUseHerbicideResolver.name)

    constructor(private readonly helpUseHerbicideService: HelpUseHerbicideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "helpUseHerbicide" })
    public async helpUseHerbicide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseHerbicideRequest
    ) {
        return this.helpUseHerbicideService.helpUseHerbicide(user, request)
    }
}
