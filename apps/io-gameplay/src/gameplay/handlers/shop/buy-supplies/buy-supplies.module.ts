import { Module } from "@nestjs/common"
import { BuySuppliesService } from "./buy-supplies.service"
import { BuySuppliesGateway } from "./buy-supplies.gateway"

@Module({
    providers: [BuySuppliesService, BuySuppliesGateway],
})
export class BuySuppliesModule {} 