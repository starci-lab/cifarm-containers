import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { BuyTileController } from "./buy-tile.controller"
import { BuyTileService } from "./buy-tile.service"

@Global()
@Module({
    imports: [
        GameplayModule
    ],
    controllers: [BuyTileController],
    providers: [BuyTileService],
    exports: [BuyTileService]
})
export class BuyTileModule {}
