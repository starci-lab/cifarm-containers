import { Module } from "@nestjs/common"
import { BuyTileResolver } from "./buy-tile.resolver"
import { BuyTileService } from "./buy-tile.service"

@Module({
    providers: [BuyTileService, BuyTileResolver ],
})
export class BuyTileModule {}
