import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    BuildingEntity,
    CropEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SupplyEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { AnimalInfoEntity } from "@src/database/gameplay-postgresql/animal-info.entity"
import { BuildingInfoEntity } from "@src/database/gameplay-postgresql/building-info.entity"
import { SeedGrowthInfoEntity } from "@src/database/gameplay-postgresql/seed-grow-info.entity"
import { WalletModule } from "@src/services/gameplay/wallet"
import { BuyTileService } from "./buy-tile.service"
import { BuyTileController } from "./buy-tile.controller"

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
        WalletModule
    ],
    controllers: [BuyTileController],
    providers: [BuyTileService],
    exports: [BuyTileService]
})
export class BuyTileModule {}
