import { Module } from "@nestjs/common"
import { DailyRewardEntity } from "@src/database"
import {
    cacheRegisterAsync,
    configForRoot,
    graphqlGameplaySubgraphForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { AnimalInfosModule } from "./animal-infos"
import { BuildingInfosModule } from "./building-infos"
import { BuildingsModule } from "./buildings"
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
import { AnimalsModule } from "./animals"
import { CropsModule } from "./crops"

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
        DailyRewardEntity,
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
        UsersModule
    ]
}) 
export class AppModule {}
