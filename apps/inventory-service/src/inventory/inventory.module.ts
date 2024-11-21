import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalInfoEntity,
    BuildingInfoEntity,
    InventoryEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/database"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    providers: [InventoryService],
    exports: [InventoryService],
    controllers: [InventoryController]
})
export class InventoryModule {}
