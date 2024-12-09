import { GetUsersArgs } from "@apps/static-subgraph/src/users/users.dto"
import { UserService } from "@apps/static-subgraph/src/users/users.service"
import { Logger, UseGuards } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { UserEntity } from "@src/database"
import { GraphqlUser } from "@src/decorators"
import { GraphqlJwtAuthGuard } from "@src/guards"
import { UserLike } from "@src/services"

@Resolver()
export class UserResolver {
    private readonly logger = new Logger(UserResolver.name)

    constructor(private readonly usersService: UserService) {}

    @Query(() => [UserEntity], {
        name: "users"
    })
    async getUsers(@Args("args") args: GetUsersArgs): Promise<Array<UserEntity>> {
        this.logger.debug(`getUsers: args=${JSON.stringify(args)}`)
        return this.usersService.getUsers(args)
    }

    @Query(() => UserEntity, { name: "random_user" })
    @UseGuards(GraphqlJwtAuthGuard)
    async randomUser(@GraphqlUser() user: UserLike): Promise<UserEntity | null> {
        return await this.usersService.getRandomUser(user.id)
    }
}