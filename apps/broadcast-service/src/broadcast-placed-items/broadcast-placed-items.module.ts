import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PlacedItemEntity } from "@src/database"
import { BroadcastPlacedItemsService } from "./broadcast-placed-items.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([PlacedItemEntity])
    ],
    controllers: [BroadcastPlacedItemsService],
    providers: [],
})
export class BroadcastPlacedItemsModule {}