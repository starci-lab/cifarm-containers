import { Module } from "@nestjs/common"
import { HarvestPlantService } from "./harvest-plant.service"
import { HarvestPlantGateway } from "./harvest-plant.gateway"

@Module({
    providers: [HarvestPlantService, HarvestPlantGateway],
})
export class HarvestPlantModule {} 