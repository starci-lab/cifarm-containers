import { Module } from "@nestjs/common"
import { PlacementMoveController } from "./placement-move.controller"
import { PlacementMoveService } from "./placement-move.service"

@Module({
    providers: [PlacementMoveService],
    controllers: [PlacementMoveController]
})
export class PlacementMoveModule {}
