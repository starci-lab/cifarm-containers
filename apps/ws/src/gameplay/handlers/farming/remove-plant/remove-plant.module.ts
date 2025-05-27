import { Module } from "@nestjs/common"
import { PlantSeedService } from "./remove-plan.service"
import { PlantSeedGateway } from "./remove-plant.gateway"

@Module({
    providers: [PlantSeedService, PlantSeedGateway],
})
export class PlantSeedModule {} 