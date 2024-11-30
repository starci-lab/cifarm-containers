import { Module } from "@nestjs/common"
import { WaterModule } from "./water"
import { HarvestCropModule } from "./harvest-crop"
import { PlantSeedModule } from "./plant-seed"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { CollectAnimalProductModule } from "./collect-animal-product"
import { FeedAnimalModule } from "./feed-animal"

@Module({
    imports: [
        WaterModule,
        HarvestCropModule,
        PlantSeedModule,
        UsePesticideModule,
        UseHerbicideModule,
        CollectAnimalProductModule,
        FeedAnimalModule
    ]
})
export class FarmingModule {}
