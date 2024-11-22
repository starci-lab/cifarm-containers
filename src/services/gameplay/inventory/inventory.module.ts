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
    SupplyEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { InventoryService } from "./inventory.service"

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
            UpgradeEntity,
            SupplyEntity,
            TileEntity
        ])
    ],
    providers: [InventoryService],
    exports: [InventoryService]
})
export class InventoryModule {}
