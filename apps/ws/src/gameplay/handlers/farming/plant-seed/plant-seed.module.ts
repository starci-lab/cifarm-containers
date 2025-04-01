import { Module } from "@nestjs/common"
import { PlantSeedService } from "./plant-seed.service"
import { PlantSeedGateway } from "./plant-seed.gateway"

@Module({
    providers: [PlantSeedService, PlantSeedGateway],
})
export class PlantSeedModule {} 