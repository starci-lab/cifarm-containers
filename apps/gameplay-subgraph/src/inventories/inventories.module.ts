import { Module } from "@nestjs/common"
import { InventoryService } from "./inventories.service"
import { InventoryResolver } from "./inventories.resolver"

@Module({
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule { 
    
}
