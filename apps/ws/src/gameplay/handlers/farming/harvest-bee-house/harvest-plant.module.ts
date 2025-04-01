import { Module } from "@nestjs/common"
import { HarvestBeeHouseService } from "./harvest-bee-house.service"
import { HarvestBeeHouseGateway } from "./harvest-plant.gateway"

@Module({
    providers: [HarvestBeeHouseService, HarvestBeeHouseGateway],
})
export class HarvestPlantModule {} 