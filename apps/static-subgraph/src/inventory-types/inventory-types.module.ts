import { Module } from "@nestjs/common"
import { InventoryTypeService } from "./inventory-types.service"
import { InventoryTypeResolver } from "./inventory-types.resolver"

@Module({
    providers: [InventoryTypeService, InventoryTypeResolver]
})
export class InventoryTypesModule {}
