import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
// import { BuildingsModule } from "./buildings"
// import { CropsModule } from "./crops"
// import { InventoriesModule } from "./inventories"
// import { PlacedItemsModule } from "./placed-items"
// import { ProductsModule } from "./products"
// import { SuppliesModule } from "./supplies"
// import { SystemsModule } from "./systems"
// import { TilesModule } from "./tiles"
// import { ToolsModule } from "./tools"
// import { UpgradesModule } from "./upgrades"
// import { UsersModule } from "./users"
import { GraphQLSubgraphModule } from "@src/graphql"
import { AnimalsModule } from "./animals"
import { CryptoModule } from "@src/crypto"
import { CacheModule } from "@src/cache"
import { JwtModule } from "@src/jwt"
import { MongooseModule } from "@src/databases"
// import { PlacedItemTypesModule } from "./placed-item-types"
// import { SpinPrizesModule } from "./spin-prizes"
// import { SpinSlotsModule } from "./spin-slots"
// import { InventoryTypesModule } from "./inventory-types"
// import { DailyRewardsModule } from "./daily-rewards"
// import { DeliveringProductsModule } from "./delivering-products"

@Module({
    imports: [
        //core modules
        EnvModule.forRoot(),
        CryptoModule.register({
            isGlobal: true
        }),
        CacheModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        GraphQLSubgraphModule.forRoot(),
        MongooseModule.forRoot(),
        //functional modules
        AnimalsModule,
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
        // UsersModule,
        // PlacedItemTypesModule,
        // SpinPrizesModule,
        // SpinSlotsModule,
        // InventoryTypesModule,
        // DailyRewardsModule,
        // UpgradesModule,
        // DeliveringProductsModule
    ]
}) 
export class AppModule {}