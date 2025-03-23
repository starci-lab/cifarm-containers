import { Module } from "@nestjs/common"
import { ThiefPlantResolver } from "./thief-plant.resolver"
import { ThiefPlantService } from "./thief-plant.service"

 
@Module({
    providers: [ThiefPlantService, ThiefPlantResolver]
})
export class ThiefPlantModule {}
