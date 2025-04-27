import { Module } from "@nestjs/common"
import { ShipWholesaleMarketService } from "./ship-wholesale-market.service"
import { ShipWholesaleMarketResolver } from "./ship-wholesale-market.resolver"


@Module({
    providers: [ShipWholesaleMarketService, ShipWholesaleMarketResolver]
})
export class ShipWholesaleMarketModule {}
