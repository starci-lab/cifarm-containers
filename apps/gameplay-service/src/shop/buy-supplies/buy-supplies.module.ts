import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SupplyEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"
import { GoldBalanceModule, InventoryModule } from "@src/services"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            CropEntity,
            ProductEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            PlacedItemTypeEntity,
            InventoryTypeEntity,
            AnimalEntity,
            TileEntity,
            SupplyEntity,
            BuildingEntity,
            UpgradeEntity
        ]),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
