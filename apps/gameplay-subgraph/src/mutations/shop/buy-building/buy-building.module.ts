import { Module } from "@nestjs/common"
import { BuyBuildingResolver } from "./buy-building.resolver"
import { BuyBuildingService } from "./buy-building.service"

@Module({
    providers: [BuyBuildingResolver, BuyBuildingService]
})
export class BuyBuildingModule {}
 