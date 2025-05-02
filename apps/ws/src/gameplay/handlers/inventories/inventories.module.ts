import { Module } from "@nestjs/common"
import { DeliverInventoryModule } from "./deliver-inventory"
import { RetrieveInventoryModule } from "./retrieve-inventory"
import { MoveInventoryModule } from "./move-inventory"

@Module({
    imports: [
        DeliverInventoryModule,
        RetrieveInventoryModule,
        MoveInventoryModule,
    ]
})
export class InventoriesModule {} 