import { Module } from "@nestjs/common"
import { DeliverInventoryModule } from "./deliver-inventory"
import { RetrieveInventoryModule } from "./retrieve-inventory"
import { MoveInventoryModule } from "./move-inventory"
import { SortInventoriesModule } from "./sort-inventories"
import { DeleteInventoryModule } from "./delete-inventory"
@Module({
    imports: [
        DeliverInventoryModule,
        RetrieveInventoryModule,
        MoveInventoryModule,
        SortInventoriesModule,
        DeleteInventoryModule
    ]
})
export class InventoriesModule {} 