import { Module } from "@nestjs/common"
import { GameplayPostgreSQLModule } from "@src/databases"
import { DebugRedisClusterModule } from "@src/debug"
import { EnvModule, RedisType } from "@src/env"
import { GraphQLModule } from "@src/graphql"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { InventoriesModule } from "./delivering-products"
import { PlacedItemsModule } from "./placed-items"
import { ProductsModule } from "./products"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UpgradesModule } from "./upgrades"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
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