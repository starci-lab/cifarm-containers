import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UsersService } from "./users.service"
import { UserSchema } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import {
    FolloweesRequest,
    FolloweesResponse,
    NeighborsRequest,
    NeighborsResponse
} from "./users.dto"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class UsersResolver {
    private readonly logger = new Logger(UsersResolver.name)
    constructor(private readonly usersService: UsersService) {}

    // if the params not provided, it will return the current user
    // to minimize the number of queries
    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => UserSchema, {
        name: "user",
        description: "Get the user"
    })
    async user( 
        @GraphQLUser() user: UserLike,
        @Args("id", { nullable: true }) id?: string
    ): Promise<UserSchema> {
        return await this.usersService.user(id ?? user.id)
    }

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => NeighborsResponse, {
        name: "neighbors",
        description: "Get neighbors of a user with pagination"
    })
    async neighbors(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => NeighborsRequest, nullable: true })
            request: NeighborsRequest
    ): Promise<NeighborsResponse> {
        return this.usersService.neighbors(user, request)
    }

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => FolloweesResponse, {
        name: "followees",
        description: "Get followees of a user with pagination"
    })
    async followees(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => FolloweesRequest, nullable: true })
            request: FolloweesRequest
    ): Promise<FolloweesResponse> {
        return this.usersService.followees(user, request)
    }
}
