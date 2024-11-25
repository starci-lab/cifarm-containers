import { Module } from "@nestjs/common"
import { SeedDataService } from "./seed-data.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    ToolEntity,
    AnimalEntity,
    BuildingEntity,
    CropEntity,
    ProductEntity,
    UpgradeEntity,
    TileEntity,
    SupplyEntity,
    DailyRewardEntity,
    DailyRewardPossibility,
    SpinEntity,
    SystemEntity,
    InventoryTypeEntity,
    InventoryEntity,
    UserEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    PlacedItemTypeEntity
} from "@src/database"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolEntity,
            AnimalEntity,
            BuildingEntity,
            CropEntity,
            ProductEntity,
            UpgradeEntity,
            TileEntity,
            SupplyEntity,
            DailyRewardEntity,
            DailyRewardPossibility,
            SpinEntity,
            SystemEntity,
            InventoryTypeEntity,
            InventoryEntity,
            UserEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            PlacedItemTypeEntity
        ])
    ],
    providers: [SeedDataService],
    exports: [SeedDataService]
})
export class SeedDataModule {}
