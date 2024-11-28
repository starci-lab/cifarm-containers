import { UserResolver } from "@apps/static-subgraph/src/users/users.resolver"
import { UserService } from "@apps/static-subgraph/src/users/users.service"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity])],
    providers: [UserService, UserResolver]
})
export class UsersModule { 
    
}
