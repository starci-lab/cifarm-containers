import { InventoryTypeResolver, InventoryTypeService } from "@apps/static-subgraph/src/inventory-types"
import { Module } from "@nestjs/common"

@Module({
    providers: [InventoryTypeService, InventoryTypeResolver]
})
export class InventoryTypesModule { }
