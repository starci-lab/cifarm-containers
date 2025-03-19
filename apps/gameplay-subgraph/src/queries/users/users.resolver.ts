import { Inject, Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, Subscription } from "@nestjs/graphql"
import { UsersService } from "./users.service"
import { UserSchema } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import {
    GetFolloweesRequest,
    GetFolloweesResponse,
    GetNeighborsRequest,
    GetNeighborsResponse
} from "./users.dto"
import { PubSub } from "graphql-subscriptions"
import { PUB_SUB, SubscriptionTopic } from "../../constants"

@Resolver()
export class UsersResolver {
    private readonly logger = new Logger(UsersResolver.name)
    constructor(
        private readonly usersService: UsersService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub
    ) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => UserSchema, {
        name: "user",
        description: "Get a user by ID"
    })
    async user(@GraphQLUser() user: UserLike): Promise<UserSchema> {
        return await this.usersService.getUser(user.id)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetNeighborsResponse, {
        name: "neighbors",
        description: "Get neighbors of a user with pagination"
    })
    async neighbors(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetNeighborsRequest
    ): Promise<GetNeighborsResponse> {
        return this.usersService.getNeighbors(user, request)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetFolloweesResponse, {
        name: "followees",
        description: "Get followees of a user with pagination"
    })
    async followees(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetFolloweesRequest
    ): Promise<GetFolloweesResponse> {
        return this.usersService.getFollowees(user, request)
    }

    @Subscription(() => UserSchema)
    async subscribeUserUpdated() {
        return this.pubSub.asyncIterableIterator(SubscriptionTopic.UserUpdated)  
    }
}
