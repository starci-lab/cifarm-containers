import { Module } from "@nestjs/common"
import { RecoverTileService } from "./recover-tile.service"
import { RecoverTileController } from "./recover-tile.controller"
import { GameplayModule } from "@src/gameplay"

@Module({
    imports: [GameplayModule],
    controllers: [RecoverTileController],
    exports: [RecoverTileService],
    providers: [RecoverTileService]
})
export class RecoverTileModule {}
