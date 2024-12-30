import { Module } from "@nestjs/common"
import { InventoryTypeService } from "./inventory-types.service"
import { InventoryTypeResolver } from "./inventory-types.resolver"
 

@Module({
    imports: [ ],
    providers: [InventoryTypeService, InventoryTypeResolver]
})
export class InventoryTypesModule {}
