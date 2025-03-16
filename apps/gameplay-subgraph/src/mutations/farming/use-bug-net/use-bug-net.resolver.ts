import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { UseBugNetService } from "./use-bug-net.service"
import { UseBugNetRequest } from "./use-bug-net.dto"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseBugNetResolver {
    private readonly logger = new Logger(UseBugNetResolver.name)

    constructor(private readonly useBugNetService: UseBugNetService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useBugNet" })
    public async useBugNet(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseBugNetRequest
    ) {
        return this.useBugNetService.useBugNet(user, request)
    }
}
