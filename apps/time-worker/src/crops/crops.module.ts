import { Module } from "@nestjs/common"
import { CropsConsumer } from "./crops.service"
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
import { cropsTimeQueueConstants } from "@apps/time-scheduler"

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
    providers: [CropsConsumer]
})
export class CropsModule {}
