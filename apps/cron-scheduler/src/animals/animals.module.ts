import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { animalsTimeQueueConstants } from "../app.constant"
import { AnimalsService } from "./animals.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    DeliveringProductEntity,
    InventoryEntity,
    PlacedItemEntity,
    SupplyEntity,
    TileEntity,
    UserEntity
} from "@src/database"

@Module({
    imports: [
        BullModule.registerQueue({
            name: animalsTimeQueueConstants.NAME
        }),
        TypeOrmModule.forFeature([
            AnimalInfoEntity,
            AnimalEntity,
            UserEntity,
            InventoryEntity,
            PlacedItemEntity,
            TileEntity,
            SupplyEntity,
            DeliveringProductEntity
        ])
    ],
    providers: [AnimalsService]
})
export class AnimalsModule {}
