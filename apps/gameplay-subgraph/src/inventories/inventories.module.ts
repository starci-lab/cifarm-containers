import { Module } from "@nestjs/common"
import { InventoryService } from "./inventories.service"
import { InventoryResolver } from "./inventories.resolver"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [InventoryService, InventoryResolver]
})
export class InventoriesModule {}
