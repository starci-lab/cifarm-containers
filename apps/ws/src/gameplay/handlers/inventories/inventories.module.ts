import { Module } from "@nestjs/common"
import { DeliverInventoriesModule } from "./deliver-inventories"
import { RetrieveInventoriesModule } from "./retrieve-inventories"
import { MoveInventoryModule } from "./move-inventory"
import { SortInventoriesModule } from "./sort-inventories"
import { DeleteInventoryModule } from "./delete-inventory"
@Module({
    imports: [
        DeliverInventoriesModule,
        RetrieveInventoriesModule,
        MoveInventoryModule,
        SortInventoriesModule,
        DeleteInventoryModule
    ]
})
export class InventoriesModule {} 