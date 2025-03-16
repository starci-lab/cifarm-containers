import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseBugNetService } from "./help-use-bug-net.service"
import { HelpUseBugNetRequest } from "./help-use-bug-net.dto"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { Args } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class HelpUseBugNetResolver {
    private readonly logger = new Logger(HelpUseBugNetResolver.name)

    constructor(private readonly helpUseBugNetService: HelpUseBugNetService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "helpUseBugNet" })
    public async helpUseBugNet(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseBugNetRequest
    ) {
        return this.helpUseBugNetService.helpUseBugNet(user, request)
    }
}
