import { Module } from "@nestjs/common"
// import { DebugRedisClusterModule } from "@src/debug"
// import { EnvModule, RedisType } from "@src/env"
// import { BuildingsModule } from "./buildings"
// import { CropsModule } from "./crops"
// import { InventoriesModule } from "./delivering-products"
// import { PlacedItemsModule } from "./placed-items"
// import { ProductsModule } from "./products"
// import { SuppliesModule } from "./supplies"
// import { SystemsModule } from "./systems"
// import { TilesModule } from "./tiles"
// import { ToolsModule } from "./tools"
// import { UpgradesModule } from "./upgrades"
// import { PostgreSQLModule } from "@src/databases"
// import { GraphQLSubgraphModule } from "@src/graphql"
// import { AnimalsModule } from "./animals"
// import { CryptoModule } from "@src/crypto"
// import { CacheModule } from "@src/cache"
// import { JwtModule } from "@src/jwt"

@Module({
    imports: [
        //core modules
        // PostgreSQLModule.forRoot(),
        // EnvModule.forRoot(),
        // GraphQLSubgraphModule.forRoot(),
        // CryptoModule.register({
        //     isGlobal: true
        // }),
        // CacheModule.register({
        //     isGlobal: true
        // }),
        // JwtModule.register({
        //     isGlobal: true
        // }),

        // //functional modules
        // AnimalsModule,
        // BuildingsModule,
        // CropsModule,
        // InventoriesModule,
        // PlacedItemsModule,
        // ProductsModule,
        // SuppliesModule,
        // SystemsModule,
        // TilesModule,
        // ToolsModule,
        // UpgradesModule,

        //debug modules
        // DebugRedisClusterModule.register({
        //     type: RedisType.Cache
        // }),
    ]
}) 
export class AppModule {}