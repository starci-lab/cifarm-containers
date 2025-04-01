import { Module } from "@nestjs/common"
import { BuyBuildingService } from "./buy-building.service"
import { BuyBuildingGateway } from "./buy-building.gateway"

@Module({
    providers: [BuyBuildingService, BuyBuildingGateway],
})
export class BuyBuildingModule {} 