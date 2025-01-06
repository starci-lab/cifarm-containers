import { Module } from "@nestjs/common"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { InventoriesModule } from "./inventories"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"
import { EnvModule, RedisType } from "@src/env"
import { GraphQLModule } from "@src/graphql"
import { DebugRedisClusterModule } from "@src/debug"
import { CacheRedisModule } from "@src/cache"

@Module({
    imports: [
        EnvModule.forRoot(),
        GraphQLModule.forSubgraph(),
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        InventoriesModule,
        PlacedItemsModule,
        ProductsModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UpgradesModule,

        //===DEBUG===//
        DebugRedisClusterModule.forRoot({
            type: RedisType.Cache
        }),
        //CacheRedisModule.forRoot()
    ]
}) 
export class AppModule {}