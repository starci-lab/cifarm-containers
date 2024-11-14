import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PlacedItemEntity } from "@src/database"
import { BroadcastPlacedItemsService } from "./broadcast-placed-items.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([PlacedItemEntity])],
    controllers: [],
    providers: [BroadcastPlacedItemsService],
    exports: [BroadcastPlacedItemsService]
})
export class BroadcastPlacedItemsModule {}
