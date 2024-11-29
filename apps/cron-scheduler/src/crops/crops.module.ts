import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { cropsTimeQueueConstants } from "../app.constant"
import { CropsService } from "./crops.service"
import {
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    DeliveringProductEntity,
    InventoryTypeEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
    imports: [
        BullModule.registerQueue({
            name: cropsTimeQueueConstants.NAME
        }),
        TypeOrmModule.forFeature([
            SeedGrowthInfoEntity,
            CropEntity,
            UserEntity,
            ProductEntity,
            InventoryTypeEntity,
            BuildingInfoEntity,
            BuildingEntity,
            UpgradeEntity,
            PlacedItemTypeEntity,
            TileEntity,
            DeliveringProductEntity
        ])
    ],
    providers: [CropsService]
})
export class CropsModule {}
