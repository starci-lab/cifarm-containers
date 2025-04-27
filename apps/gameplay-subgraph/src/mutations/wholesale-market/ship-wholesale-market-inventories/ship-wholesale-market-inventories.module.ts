import { Module } from "@nestjs/common"
import { ShipWholesaleMarketService } from "./ship-wholesale-market-inventories.service"
import { ShipWholesaleMarketResolver } from "./ship-wholesale-market-inventories.resolver"


@Module({
    providers: [ShipWholesaleMarketService, ShipWholesaleMarketResolver]
})
export class ShipWholesaleMarketModule {}
