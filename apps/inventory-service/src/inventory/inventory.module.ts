import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, PlacedItemEntity, UserEntity } from "@src/database"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity, PlacedItemEntity])],
    providers: [InventoryService],
    exports: [InventoryService],
    controllers: [InventoryController]
})
export class InventoryModule {}
