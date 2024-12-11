import { Module } from "@nestjs/common"
import { MoveModule } from "./move"
import { PlaceTileModule } from "./place-tile"
@Module({
    imports: [
        MoveModule,
        PlaceTileModule
    ]
})
export class PlacementModule {}
