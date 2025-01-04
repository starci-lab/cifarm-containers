import { Module } from "@nestjs/common"

import { AnimalInfosModule } from "./animal-infos"
import { AnimalsModule } from "./animals"
import { BuildingInfosModule } from "./building-infos"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { InventoriesModule } from "./inventories"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SeedGrowthInfosModule } from "./seed-growth-infos"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"
import { UsersModule } from "./users"
import { EnvModule } from "@src/env"
import { GraphQLModule } from "@src/graphql"

@Module({
    imports: [
        EnvModule.forRoot(),
        GraphQLModule.forSubgraph(),
        AnimalInfosModule,
        AnimalsModule,
        BuildingInfosModule,
        BuildingsModule,
        CropsModule,
        InventoriesModule,
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