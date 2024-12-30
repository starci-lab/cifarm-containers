import { Module } from "@nestjs/common"
import { UserService } from "./users.service"
import { UserResolver } from "./users.resolver"
 

@Module({
    imports: [ ],
    providers: [UserService, UserResolver]
})
export class UsersModule { 
    
}
