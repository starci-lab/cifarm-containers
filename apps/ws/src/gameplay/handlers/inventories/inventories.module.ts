import { Module } from "@nestjs/common"
import { DeliverInventoryModule } from "./deliver-inventory"
import { RetainInventoryModule } from "./retain-inventory"
import { DeliverAdditionalInventoryModule } from "./deliver-additional-inventory"
import { MoveInventoryModule } from "./move-inventory"
@Module({
    imports: [
        DeliverInventoryModule,
        RetainInventoryModule,
        DeliverAdditionalInventoryModule,
        MoveInventoryModule
    ]
})
export class InventoriesModule {} 