import { Module } from "@nestjs/common"
import { InventoryTypesResolver } from "./inventory-types.resolver"
import { InventoryTypesService } from "./inventory-types.service"

@Module({
    providers: [InventoryTypesService, InventoryTypesResolver]
})
export class InventoryTypesModule {}