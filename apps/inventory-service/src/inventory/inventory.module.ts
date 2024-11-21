import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    InventoryEntity,
    PlacedItemEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    UpgradeEntity,
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
            BuildingInfoEntity,
            CropEntity,
            ProductEntity,
            AnimalEntity,
            BuildingEntity,
            AnimalEntity,
            UpgradeEntity
        ])
    ],
    providers: [InventoryService],
    exports: [InventoryService],
    controllers: [InventoryController]
})
export class InventoryModule {}
