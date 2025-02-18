import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UsersService } from "./users.service"
import { UserSchema } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GetNeighborsArgs, GetNeighborsResponse } from "./users.dto"

@Resolver()
export class UsersResolver {
    private readonly logger = new Logger(UsersResolver.name)

    constructor(private readonly usersService: UsersService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => UserSchema, {
        name: "user"
    })
    async user(@GraphQLUser() user: UserLike): Promise<UserSchema> {
        return await this.usersService.getUser(user.id)
    } 

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetNeighborsResponse, {
        name: "neighbors"
    })
    async neighbors(
            @GraphQLUser() user: UserLike,
            @Args("args") args: GetNeighborsArgs
    ): Promise<GetNeighborsResponse> {
        return this.usersService.getNeighbors(user, args)
    }
}
