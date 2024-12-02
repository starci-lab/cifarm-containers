import { Module } from "@nestjs/common"
import { PlaceTitleModule } from "./place-tile"
import { PlacementMoveModule } from "./placement-move"
@Module({
    imports: [
        PlacementMoveModule ,
        PlaceTitleModule  
    ]
})
export class PlacementModule {}
