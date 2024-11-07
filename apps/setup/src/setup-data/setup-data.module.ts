import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, BuildingEntity, CropEntity, DailyRewardEntity, DailyRewardPossibility, MarketPricingEntity, PlacedItemEntity, SupplyEntity, TileEntity, ToolEntity, UpgradeEntity } from "@src/database"
import { SetupDataService } from "./setup-data.service"

@Module({
    imports: [TypeOrmModule.forFeature([ToolEntity,
        AnimalEntity,
        BuildingEntity,
        CropEntity,
        MarketPricingEntity,
        PlacedItemEntity,
        UpgradeEntity,
        TileEntity,
        SupplyEntity,
        DailyRewardEntity,
        DailyRewardPossibility
    ])],
    providers: [SetupDataService],
})
export class SetupDataModule {}