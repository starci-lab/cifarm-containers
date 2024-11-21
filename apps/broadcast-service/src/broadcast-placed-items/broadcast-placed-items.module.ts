import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalInfoEntity,
    BuildingInfoEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity
} from "@src/database"
import { BroadcastPlacedItemsService } from "./broadcast-placed-items.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    controllers: [],
    providers: [BroadcastPlacedItemsService],
    exports: [BroadcastPlacedItemsService]
})
export class BroadcastPlacedItemsModule {}
