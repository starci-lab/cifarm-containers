import { Module } from "@nestjs/common"
import { BuyTileService } from "./buy-tile.service"
import { BuyTileGateway } from "./buy-tile.gateway"

@Module({
    providers: [BuyTileService, BuyTileGateway],
})
export class BuyTileModule {} 