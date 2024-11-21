import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PlacedItemEntity } from "@src/database"
import { BroadcastPlacedItemsService } from "./broadcast-placed-items.service"
import { AnimalInfoEntity } from "@src/database/gameplay-postgresql/animal-info.entity"
import { BuildingInfoEntity } from "@src/database/gameplay-postgresql/building-info.entity"
import { SeedGrowthInfoEntity } from "@src/database/gameplay-postgresql/seed-grow-info.entity"

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
