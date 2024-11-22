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
import { BalanceService } from "./balance.service"

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
            AnimalEntity,
            ProductEntity,
            CropEntity,
            BuildingEntity,
            UpgradeEntity
        ])
    ],
    providers: [BalanceService],
    exports: [BalanceService]
})
export class BalanceModule {}
