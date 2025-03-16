import { Module } from "@nestjs/common"
import { MoveInventoryService } from "./move-inventory.service"
import { MoveInventoryResolver } from "./move-inventory.resolver"

@Module({
    providers: [MoveInventoryService, MoveInventoryResolver]
})
export class MoveInventoryModule {}
