import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    DailyRewardEntity,
    DailyRewardPossibility,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SpinEntity,
    SupplyEntity,
    SystemEntity,
    TileEntity,
    ToolEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { PlacedItemTypeEntity } from "@src/database/gameplay-postgresql/placed-item-type.entity"
import { SeedDataService } from "./seed-data.service"

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
    providers: [SeedDataService]
})
export class SeedDataModule {}
