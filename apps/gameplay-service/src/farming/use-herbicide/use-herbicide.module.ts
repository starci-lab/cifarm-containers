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
    TileEntity,
    UserEntity
} from "@src/database"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideController } from "./use-herbicide.controller"

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
            SupplyEntity
        ]),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService],
    exports: [UseHerbicideService]
})
export class UseHerbicideModule {}
