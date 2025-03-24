import { Module } from "@nestjs/common"
import { ThiefPlantGateway } from "./thief-plant.gateway"
import { ThiefPlantService } from "./thief-plant.service"

@Module({
    providers: [ThiefPlantService, ThiefPlantGateway],
})
export class ThiefPlantModule {} 