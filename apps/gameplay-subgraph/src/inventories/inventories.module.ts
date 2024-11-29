import { InventoryResolver } from "@apps/gameplay-subgraph/src/inventories/inventories.resolver"
import { InventoryService } from "@apps/gameplay-subgraph/src/inventories/inventories.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule { 
    
}
