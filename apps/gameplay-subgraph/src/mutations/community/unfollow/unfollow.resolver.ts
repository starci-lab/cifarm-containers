import { Logger, UseGuards } from "@nestjs/common"
import { UnfollowService } from "./unfollow.service"
import { UnfollowRequest } from "./unfollow.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UnfollowResolver {
    private readonly logger = new Logger(UnfollowResolver.name)

    constructor(private readonly unfollowService: UnfollowService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "unfollow",
        description: "Unfollow a user",
        nullable: true
    })
    public async unfollow(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UnfollowRequest
    ) {
        return this.unfollowService.unfollow(user, request)
    }
}
