import { Module } from "@nestjs/common"
import { MoveInventoryService } from "./move-inventory.service"
import { MoveInventoryGateway } from "./move-inventory.gateway"

@Module({
    providers: [MoveInventoryService, MoveInventoryGateway]
})
export class MoveInventoryModule {}
