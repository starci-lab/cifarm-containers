import { Module } from "@nestjs/common"
import { PlaceTileController } from "./place-tile.controller"
import { PlaceTileService } from "./place-tile.service"

@Module({
    imports: [],
    controllers: [PlaceTileController],
    providers: [PlaceTileService],
    exports: [PlaceTileService]
})
export class PlaceTileModule {}
