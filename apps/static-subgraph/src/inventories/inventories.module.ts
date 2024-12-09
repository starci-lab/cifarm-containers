import { InventoryResolver } from "@apps/static-subgraph/src/inventories/inventories.resolver"
import { InventoryService } from "@apps/static-subgraph/src/inventories/inventories.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule {}
