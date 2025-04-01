import { Logger, UseGuards } from "@nestjs/common"
import { UnfollowService } from "./unfollow.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { UnfollowRequest, UnfollowResponse } from "./unfollow.dto"

@Resolver()
export class UnfollowResolver {
    private readonly logger = new Logger(UnfollowResolver.name)

    constructor(private readonly unfollowService: UnfollowService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => UnfollowResponse, {
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
