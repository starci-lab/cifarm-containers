import { Module } from "@nestjs/common"
import { BroadcastGateway } from "./broadcast.gateway"
import { WsJwtAuthModule } from "@src/guards"
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
    SupplyEntity,
    TileEntity,
    UpgradeEntity
} from "@src/database"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Add entities here
            PlacedItemEntity,
            InventoryEntity,
            DeliveringProductEntity,
            ProductEntity,
            CropEntity,
            BuildingEntity,
            UpgradeEntity,
            PlacedItemTypeEntity,
            InventoryTypeEntity,
            AnimalEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            TileEntity,
            SupplyEntity
        ]),
        WsJwtAuthModule
    ],
    controllers: [],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
