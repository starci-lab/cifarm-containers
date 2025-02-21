import { Module } from "@nestjs/common"
import { MoveInventoryService } from "./move-inventory.service"
import { MoveInventoryController } from "./move-inventory.controller"


@Module({
    imports: [],
    providers: [MoveInventoryService],
    controllers: [MoveInventoryController]
})
export class MoveInventoryModule {}
