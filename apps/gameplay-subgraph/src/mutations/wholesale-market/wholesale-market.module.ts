import { Module } from "@nestjs/common"
import { ShipWholesaleMarketModule } from "./ship-wholesale-market"

@Module({
    imports: [ShipWholesaleMarketModule]
})
export class WholesaleMarketModule {}
