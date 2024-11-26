import { Module } from "@nestjs/common"
import { WaterModule } from "./water"
import { HarvestCropModule } from "./harvest-crop"
import { PlantSeedModule } from "./plant-seed"

@Module({
    imports: [WaterModule, HarvestCropModule, PlantSeedModule]
})
export class FarmingModule {}
