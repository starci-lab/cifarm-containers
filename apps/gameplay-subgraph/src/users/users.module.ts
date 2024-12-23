import { Module } from "@nestjs/common"
import { UserService } from "./users.service"
import { UserResolver } from "./users.resolver"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [UserService, UserResolver]
})
export class UsersModule { 
    
}
