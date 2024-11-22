import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    BuildingEntity,
    CropEntity,
    DailyRewardEntity,
    DailyRewardPossibility,
    ProductEntity,
    SpinEntity,
    SupplyEntity,
    SystemEntity,
    TileEntity,
    ToolEntity,
    UpgradeEntity
} from "@src/database"
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
            SystemEntity
        ])
    ],
    providers: [SeedDataService]
})
export class SeedDataModule {}
