import { Module } from "@nestjs/common"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ProductsModule } from "./products"
import { InventoriesModule } from "./inventories"
import { InventoryTypesModule } from "./inventory-types"
import { PlacedItemTypesModule } from "./placed-item-types"
import { SpinPrizesModule } from "./spin-prizes"
import { SpinSlotsModule } from "./spin-slots"
import { SuppliesModule } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UsersModule } from "./users"
import { PetsModule } from "./pets"
import { FruitsModule } from "./fruits"
import { PlacedItemsModule } from "./placed-items"

@Module({
    imports: [
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        FruitsModule,
        InventoriesModule,
        InventoryTypesModule,
        PlacedItemTypesModule,
        SpinPrizesModule,
        SpinSlotsModule,
        SuppliesModule,
        SystemsModule,
        PlacedItemsModule,
        TilesModule,
        ToolsModule,
        UsersModule,
        PetsModule,
        ProductsModule,
    ]
})
export class QueriesModule {}
