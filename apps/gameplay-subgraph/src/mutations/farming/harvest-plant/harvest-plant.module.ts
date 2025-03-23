import { Module } from "@nestjs/common"
import { HarvestPlantResolver } from "./harvest-plant.resolver"
import { HarvestPlantService } from "./harvest-plant.service"

 
@Module({
    providers: [HarvestPlantService, HarvestPlantResolver]
})
export class HarvestPlantModule {}
