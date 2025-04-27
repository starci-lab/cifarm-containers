import { Module } from "@nestjs/common"
import { MoveInventoryWholesaleMarketService } from "./move-inventory-wholesale-market.service"
import { MoveInventoryWholesaleMarketGateway } from "./move-inventory-wholesale-market.gateway"

@Module({
    providers: [MoveInventoryWholesaleMarketService, MoveInventoryWholesaleMarketGateway]
})
export class MoveInventoryWholesaleMarketModule {} 