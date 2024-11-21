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
import { BalanceService } from "./balance.service"
import { BalanceController } from "./balance.controller"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity
        ])
    ],
    providers: [BalanceController],
    exports: [BalanceService]
})
export class BalanceModule {}
