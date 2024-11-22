import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    InventoryEntity,
    PlacedItemEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/database"
import { EnergyModule } from "@src/services"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            ProductEntity,
            AnimalEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ]),
        EnergyModule
    ],
    providers: [],
    exports: []
})
export class BuyAnimalsModule {}
