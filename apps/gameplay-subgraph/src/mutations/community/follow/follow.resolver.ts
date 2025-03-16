import { Logger, UseGuards } from "@nestjs/common"
import { FollowService } from "./follow.service"
import { FollowRequest } from "./follow.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { VoidResolver } from "graphql-scalars"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class FollowResolver {
    private readonly logger = new Logger(FollowResolver.name)

    constructor(private readonly followService: FollowService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "follow" })
    public async follow(@GraphQLUser() user: UserLike, @Args("request") request: FollowRequest): Promise<void> {
        return this.followService.follow(user, request)
    }
}
