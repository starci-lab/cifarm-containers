import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseBugNetService } from "./help-use-bug-net.service"
import { HelpUseBugNetRequest } from "./help-use-bug-net.dto"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Args } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUseBugNetResolver {
    private readonly logger = new Logger(HelpUseBugNetResolver.name)

    constructor(private readonly helpUseBugNetService: HelpUseBugNetService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUseBugNet",
        description: "Help use bug net",
        nullable: true
    })
    public async helpUseBugNet(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseBugNetRequest
    ) {
        return this.helpUseBugNetService.helpUseBugNet(user, request)
    }
}
