import { Module } from "@nestjs/common"
import { DeliverInventoryModule } from "./deliver-inventory"
import { RetrieveInventoryModule } from "./retrieve-inventory"
import { DeliverAdditionalInventoryModule } from "./deliver-additional-inventory"
import { MoveInventoryModule } from "./move-inventory"
@Module({
    imports: [
        DeliverInventoryModule,
        RetrieveInventoryModule,
        DeliverAdditionalInventoryModule,
        MoveInventoryModule
    ]
})
export class InventoriesModule {} 