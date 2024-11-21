import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalInfoEntity,
    BuildingInfoEntity,
    InventoryEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/database"
import { PlacedItemService } from "./placed-item.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            PlacedItemEntity,
            UserEntity,
            InventoryEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    providers: [PlacedItemService],
    exports: [PlacedItemService]
})
export class PlacedItemModule {}
