import { Module } from "@nestjs/common"
import { BuySuppliesResolver } from "./buy-supplies.resolver"
import { BuySuppliesService } from "./buy-supplies.service"

@Module({
    providers: [BuySuppliesService, BuySuppliesResolver]
})
export class BuySuppliesModule {}
