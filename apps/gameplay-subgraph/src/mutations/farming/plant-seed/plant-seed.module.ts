import { Module } from "@nestjs/common"
import { PlantSeedResolver } from "./plant-seed.resolver"
import { PlantSeedService } from "./plant-seed.service"

@Module({
    providers: [PlantSeedService, PlantSeedResolver]
})
export class PlantSeedModule {}
