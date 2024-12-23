import { Module } from "@nestjs/common"
import { MoveModule } from "./move"
import { PlaceTileModule } from "./place-tile"
import { RecoverTileModule } from "./recover-tile"
@Module({
    imports: [
        MoveModule,
        PlaceTileModule,
        RecoverTileModule
    ]
})
export class PlacementModule {}
