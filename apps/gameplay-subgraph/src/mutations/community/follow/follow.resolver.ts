import { Logger, UseGuards } from "@nestjs/common"
import { FollowService } from "./follow.service"
import { FollowRequest, FollowResponse } from "./follow.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class FollowResolver {
    private readonly logger = new Logger(FollowResolver.name)

    constructor(private readonly followService: FollowService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => FollowResponse, {
        name: "follow",
        description: "Follow a user",
        nullable: true
    })
    public async follow(@GraphQLUser() user: UserLike, @Args("request") request: FollowRequest) {
        return this.followService.follow(user, request)
    }
}
