import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UserService } from "./users.service"
import { UserEntity } from "@src/database"
import { GetUsersArgs } from "./"

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

    @Query(() => UserEntity, {
        name: "user",
        nullable:true
    })
    async getUserById(@Args("id") id: string): Promise<UserEntity | null> {
        this.logger.debug(`getUserById: id=${id}`)
        return this.usersService.getUserById(id)
    }
}
