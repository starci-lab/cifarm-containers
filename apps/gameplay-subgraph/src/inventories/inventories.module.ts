import { Module } from "@nestjs/common"
import { InventoryService } from "./inventories.service"
import { InventoryResolver } from "./inventories.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule {}
