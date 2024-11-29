import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    CropEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SupplyEntity,
    SystemEntity,
    TileEntity,
    UserEntity
} from "@src/database"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { PlantSeedService } from "./plant-seed.service"
import { PlantSeedController } from "./plant-seed.controller"

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
            SystemEntity
        ]),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}
