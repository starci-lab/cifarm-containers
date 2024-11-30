import {
    InventoryTypeResolver,
    InventoryTypeService
} from "./index"
import { Module } from "@nestjs/common"

@Module({
    providers: [InventoryTypeService, InventoryTypeResolver]
})
export class InventoryTypesModule {}
