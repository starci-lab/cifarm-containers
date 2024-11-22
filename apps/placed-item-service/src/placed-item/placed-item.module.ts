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
import { PlacedItemService } from "./placed-item.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            PlacedItemEntity,
            UserEntity,
            InventoryEntity,
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
    providers: [PlacedItemService],
    exports: [PlacedItemService]
})
export class PlacedItemModule {}
