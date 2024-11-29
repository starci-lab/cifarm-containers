import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    DeliveringProductEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SpinPrizeEntity,
    SpinSlotEntity,
    SupplyEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"
import { InventoryModule, WalletModule } from "@src/services"

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
            UpgradeEntity,
            DeliveringProductEntity,
            SpinPrizeEntity,
            SpinSlotEntity
        ]),
        WalletModule,
        InventoryModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}
