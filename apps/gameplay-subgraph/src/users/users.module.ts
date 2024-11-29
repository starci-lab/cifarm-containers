import { UserResolver } from "@apps/gameplay-subgraph/src/users/users.resolver"
import { UserService } from "@apps/gameplay-subgraph/src/users/users.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [UserService, UserResolver]
})
export class UsersModule { 
    
}
