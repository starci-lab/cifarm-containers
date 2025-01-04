import { Module } from "@nestjs/common"
import { UserService } from "./users.service"
import { UserResolver } from "./users.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [UserService, UserResolver]
})
export class UsersModule { 
    
}
