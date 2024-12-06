import { UserResolver } from "@apps/static-subgraph/src/users/users.resolver"
import { UserService } from "@apps/static-subgraph/src/users/users.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [UserService, UserResolver]
})
export class UsersModule {}
