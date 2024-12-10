import { Module } from "@nestjs/common"
import { InventoryTypeService } from "./inventory-types.service"
import { InventoryTypeResolver } from "./inventory-types.resolver"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [InventoryTypeService, InventoryTypeResolver]
})
export class InventoryTypesModule {}
