import { Module } from "@nestjs/common"
import {
    cacheRegisterAsync,
    configForRoot,
    gameplaySubgraphForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { AnimalInfoThievedByUsersModule } from "./animal-info-thieved-by-users"
import { AnimalInfosModule } from "./animal-infos"
import { AnimalsModule } from "./animals"
import { BuildingInfosModule } from "./building-infos"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { InventoriesModule } from "./inventories"
import { InventoryTypesModule } from "./inventory-types"
import { PlacedItemTypesModule } from "./placed-item-types"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SeedGrowthInfosModule } from "./seed-growth-infos"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"
import { UsersModule } from "./users"
import { HealthCheckModule } from "./health-check"

@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        cacheRegisterAsync(),
        gameplaySubgraphForRoot(),
        AnimalInfoThievedByUsersModule,
        AnimalInfosModule,
        AnimalsModule,
        BuildingInfosModule,
        BuildingsModule,
        CropsModule,
        InventoriesModule,
        InventoryTypesModule,
        PlacedItemTypesModule,
        PlacedItemsModule,
        ProductsModule,
        SeedGrowthInfosModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UpgradesModule,
        UsersModule,
        HealthCheckModule
    ]
}) 
export class AppModule {}