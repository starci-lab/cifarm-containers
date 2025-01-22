import { Module } from "@nestjs/common"
import { RecoverTileService } from "./recover-tile.service"
import { RecoverTileController } from "./recover-tile.controller"

@Module({
    controllers: [RecoverTileController],
    providers: [RecoverTileService]
})
export class RecoverTileModule {}
