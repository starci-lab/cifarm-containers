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
import { BuyAnimalService } from "./buy-animal.service"

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
        ])
    ],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalsModule {}
