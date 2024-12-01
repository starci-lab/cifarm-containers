import { Module } from "@nestjs/common"
import {
    cacheRegisterAsync,
    configForRoot,
    graphqlGameplaySubgraphForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { AnimalInfosModule } from "./animal-infos"
import { AnimalsModule, CropsModule } from "@apps/cron-scheduler"
import { DailyRewardEntity } from "@src/database"
import { BuildingInfosModule } from "./building-infos"
import { BuildingsModule } from "./buildings"
import { DailyRewardPossibilitiesModule } from "./daily-reward-possibilities"
import { InventoriesModule } from "./inventories"
import { InventoryTypesModule } from "./inventory-types"
import { PlacedItemTypesModule } from "./placed-item-types"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SeedGrowthInfosModule } from "./seed-growth-infos"
import { SpinsModule } from "./spins"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"
import { UsersModule } from "./users"

@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        cacheRegisterAsync(),
        graphqlGameplaySubgraphForRoot(),
        //AnimalInfoThievedByUsersModule,
        AnimalInfosModule,
        AnimalsModule,
        BuildingInfosModule,
        BuildingsModule,
        CropsModule,
        DailyRewardPossibilitiesModule,
        DailyRewardEntity,
        InventoriesModule,
        InventoryTypesModule,
        PlacedItemTypesModule,
        PlacedItemsModule,
        ProductsModule,
        SeedGrowthInfosModule,
        SpinsModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UpgradesModule,
        UsersModule
    ]
})
export class AppModule {}
