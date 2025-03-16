import { Module } from "@nestjs/common"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ProductsModule } from "./products"
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
import { PetsModule } from "./pets"
import { FruitsModule } from "./fruits"
@Module({
    imports: [
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        FruitsModule,
        InventoriesModule,
        InventoryTypesModule,
        PlacedItemTypesModule,
        PlacedItemsModule,
        SpinPrizesModule,
        SpinSlotsModule,
        SuppliesModule,
        SystemsModule,
        TilesModule,
        ToolsModule,
        UsersModule,
        PetsModule,
        ProductsModule,
    ]
})
export class QueriesModule {}
