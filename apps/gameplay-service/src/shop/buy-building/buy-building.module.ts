import { Module } from "@nestjs/common"
import { BuyBuildingController } from "./buy-building.controller"
import { BuyBuildingService } from "./buy-building.service"

@Module({
    controllers: [BuyBuildingController],
    providers: [BuyBuildingService]
})
export class BuyBuildingModule {}
 