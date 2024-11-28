import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalInfoEntity, BuildingEntity, BuildingInfoEntity, PlacedItemEntity, PlacedItemTypeEntity, SeedGrowthInfoEntity, UpgradeEntity } from "@src/database"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"

@Module({
    imports: [TypeOrmModule.forFeature([
        BuildingEntity,
        UpgradeEntity,
        PlacedItemTypeEntity,
        PlacedItemEntity,
        SeedGrowthInfoEntity,
        AnimalInfoEntity,
        BuildingInfoEntity
    ])],
    providers: [BuildingsService, BuildingsResolver]
})
export class BuildingsModule { }
