import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, BuildingEntity, CropEntity, MarketPricingEntity, UpgradeEntity } from "@src/database"
import { SetupDataService } from "./setup-data.service"

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEntity, CropEntity, MarketPricingEntity, BuildingEntity, UpgradeEntity])],
    providers: [SetupDataService],
})
export class SetupDataModule {}