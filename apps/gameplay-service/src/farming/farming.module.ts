import { Module } from "@nestjs/common"
import { HarvestCropModule } from "./harvest-crop"
import { PlantSeedModule } from "./plant-seed"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { CollectAnimalProductModule } from "./collect-animal-product"
import { FeedAnimalModule } from "./feed-animal"
import { CureAnimalModule } from "./cure-animal"
import { UseFertilizerModule } from "./use-fertilizer"
import { WaterCropModule } from "./water-crop"

@Module({
    imports: [
        CollectAnimalProductModule,
        CureAnimalModule,
        FeedAnimalModule,
        HarvestCropModule,
        PlantSeedModule,
        UseFertilizerModule,
        UseHerbicideModule,
        UsePesticideModule,
        WaterCropModule,
    ]
})
export class FarmingModule {}
