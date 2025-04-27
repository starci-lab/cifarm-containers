import { Module } from "@nestjs/common"
import { DeliverInventoryModule } from "./deliver-inventory"
import { RetrieveInventoryModule } from "./retrieve-inventory"
import { DeliverAdditionalInventoryModule } from "./deliver-additional-inventory"
import { MoveInventoryModule } from "./move-inventory"
import { MoveInventoryWholesaleMarketModule } from "./move-inventory-wholesale-market"

@Module({
    imports: [
        DeliverInventoryModule,
        RetrieveInventoryModule,
        DeliverAdditionalInventoryModule,
        MoveInventoryModule,
        MoveInventoryWholesaleMarketModule
    ]
})
export class InventoriesModule {} 