import { Module } from "@nestjs/common"
import { CropsWorker } from "./crops.service"
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
    SystemEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BullModule } from "@nestjs/bullmq"
import { cropsTimeQueueConstants } from "@apps/cron-scheduler"

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
            BuildingInfoEntity,
            BuildingEntity,
            UpgradeEntity,
            PlacedItemTypeEntity,
            TileEntity,
            InventoryTypeEntity,
            InventoryEntity,
            PlacedItemEntity,
            AnimalEntity,
            AnimalInfoEntity,
            SupplyEntity,
            SystemEntity
        ])
    ],
    providers: [CropsWorker]
})
export class CropsModule {}
