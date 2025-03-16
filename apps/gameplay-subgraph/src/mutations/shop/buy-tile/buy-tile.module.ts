import { Module } from "@nestjs/common"
import { BuyTileController } from "./buy-tile.resolver"
import { BuyTileService } from "./buy-tile.service"

@Module({
    controllers: [BuyTileController],
    providers: [BuyTileService],
})
export class BuyTileModule {}
