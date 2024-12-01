import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { DeliveryService } from "./delivery.service"
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
import { deliveryTimeQueueConstants } from "../app.constant"

@Module({
    imports: [
        BullModule.registerQueue({
            name: deliveryTimeQueueConstants.name
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
    providers: [DeliveryService]
})
export class DeliveryModule {}
