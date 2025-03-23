import { Module } from "@nestjs/common"
import { HarvestPlantModule } from "./harvest-plant"
import { PlantSeedModule } from "./plant-seed"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { HarvestAnimalModule } from "./harvest-animal"
import { FeedAnimalModule } from "./feed-animal"
import { CureAnimalModule } from "./cure-animal"
import { UseFertilizerModule } from "./use-fertilizer"
import { WaterCropModule } from "./water-crop"
import { HarvestFruitModule } from "./harvest-fruit"
import { UseBugNetModule } from "./use-bug-net"
import { UseFruitFertilizerModule } from "./use-fruit-fertilizer"

@Module({
    imports: [
        HarvestAnimalModule,
        CureAnimalModule,
        FeedAnimalModule,
        HarvestPlantModule,
        PlantSeedModule,
        UseFertilizerModule,
        UseHerbicideModule,
        UsePesticideModule,
        WaterCropModule,
        HarvestFruitModule,
        UseBugNetModule,
        UseFruitFertilizerModule
    ]
})
export class FarmingModule {}
