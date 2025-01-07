import { Module } from "@nestjs/common"
import { InventoryService } from "./inventories.service"
import { InventoryResolver } from "./inventories.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
import { JwtModule } from "@src/jwt"

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature(), JwtModule ],
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule {}
