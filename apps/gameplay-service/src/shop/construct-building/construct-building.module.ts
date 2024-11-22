import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import {
    CropEntity,
    InventoryEntity,
    PlacedItemEntity,
    ProductEntity,
    UserEntity
} from "@src/database"
import { ConstructBuildingService } from "./construct-building.service"
import { SeedGrowthInfoEntity } from "@src/database/gameplay-postgresql/seed-grow-info.entity"
import { AnimalInfoEntity } from "@src/database/gameplay-postgresql/animal-info.entity"
import { BuildingInfoEntity } from "@src/database/gameplay-postgresql/building-info.entity"
import { WalletModule } from "@src/services/gameplay/wallet"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            CropEntity,
            ProductEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ]),
        WalletModule
    ],
    providers: [ConstructBuildingService],
    exports: [ConstructBuildingService]
})
export class ConstructBuildingModule {}
