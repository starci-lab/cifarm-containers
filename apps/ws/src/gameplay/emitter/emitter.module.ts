import { Module } from "@nestjs/common"
import { ActionModule } from "./actions"
import { PlacedItemsModule } from "./placed-items"
import { UserModule } from "./user"
import { InventoriesModule } from "./inventories"
import { ConfigurableModuleClass } from "./emitter.module-definition"
import { EmitterService } from "./emitter.service"
// emitter module
@Module({
    imports: [ActionModule, PlacedItemsModule, UserModule, InventoriesModule],
    // re-export for convenience
    exports: [EmitterService],
    providers: [EmitterService]
})
export class EmitterModule extends ConfigurableModuleClass {}   
