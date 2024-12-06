import { GetUsersArgs } from "@apps/static-subgraph/src/users/users.dto"
import { UserService } from "@apps/static-subgraph/src/users/users.service"
import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { UserEntity } from "@src/database"

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
}
