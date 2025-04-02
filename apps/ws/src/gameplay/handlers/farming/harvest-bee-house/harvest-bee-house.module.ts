import { Module } from "@nestjs/common"
import { HarvestBeeHouseService } from "./harvest-bee-house.service"
import { HarvestBeeHouseGateway } from "./harvest-bee-house.gateway"

@Module({
    providers: [HarvestBeeHouseService, HarvestBeeHouseGateway],
})
export class HarvestBeeHouseModule {} 