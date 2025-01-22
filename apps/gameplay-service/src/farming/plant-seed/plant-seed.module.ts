import { Module } from "@nestjs/common"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"

@Module({
    controllers: [PlantSeedController],
    providers: [PlantSeedService]
})
export class PlantSeedModule {}
