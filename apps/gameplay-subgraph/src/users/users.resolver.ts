import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { UsersService } from "./users.service"
import { UserEntity } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class UsersResolver {
    private readonly logger = new Logger(UsersResolver.name)

    constructor(private readonly usersService: UsersService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => UserEntity, {
        name: "user"
    })
    async getUser(@GraphQLUser() user: UserLike): Promise<UserEntity> {
        return await this.usersService.getUser(user.id)
    } 
}
