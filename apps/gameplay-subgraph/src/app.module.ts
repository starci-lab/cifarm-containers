import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { GraphQLSubgraphModule } from "@src/graphql"
import { AnimalsModule } from "./animals"
import { CryptoModule } from "@src/crypto"
import { CacheModule } from "@src/cache"
import { JwtModule } from "@src/jwt"
import { MongooseModule } from "@src/databases"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ProductsModule } from "./products"
import { DeliveringProductsModule } from "./delivering-products"
import { InventoriesModule } from "./inventories"
import { InventoryTypesModule } from "./inventory-types"
import { PlacedItemTypesModule } from "./placed-item-types"
import { PlacedItemsModule } from "./placed-items"
import { SpinPrizesModule } from "./spin-prizes"
import { SpinSlotsModule } from "./spin-slots"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UsersModule } from "./users"

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
        BuildingsModule,
        CropsModule,
        ProductsModule,
        InventoriesModule,
        PlacedItemsModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UsersModule,
        PlacedItemTypesModule,
        SpinPrizesModule,
        SpinSlotsModule,
        InventoryTypesModule,
        DeliveringProductsModule
    ]
}) 
export class AppModule {}