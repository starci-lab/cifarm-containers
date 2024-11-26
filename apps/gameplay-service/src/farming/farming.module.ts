import { Module } from "@nestjs/common"
import { WaterModule } from "./water"
import { HarvestCropModule } from "./harvest-crop"
import { PlantSeedModule } from "./plant-seed"
import { UsePestisideModule } from "./use-pestiside"
import { UseHerbicideModule } from "./use-herbicide"

@Module({
    imports: [
        WaterModule,
        HarvestCropModule,
        PlantSeedModule,
        UsePestisideModule,
        UseHerbicideModule
    ]
})
export class FarmingModule {}
