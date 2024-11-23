import { Global, Module } from "@nestjs/common"
import { InventoryService } from "./inventory.service"

@Global()
@Module({
    imports: [],
    providers: [InventoryService],
    exports: [InventoryService]
})
export class InventoryModule {}
