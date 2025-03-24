import { Module } from "@nestjs/common"
import { UseWateringCanModule } from "./use-watering-can"
import { UseFertilizerModule } from "./use-fertilizer"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { UseAnimalFeedModule } from "./use-animal-feed"
import { UseAnimalMedicineModule } from "./use-animal-medicine"
import { HarvestAnimalModule } from "./harvest-animal"
// import { HarvestFruitModule } from "./harvest-fruit"
// import { UseBugNetModule } from "./use-bug-net"
// import { UseFruitFertilizerModule } from "./use-fruit-fertilizer"
// import { TendCropModule } from "./tend-crop"
// import { HarvestCropModule } from "./harvest-crop"
// import { FeedAnimalModule } from "./feed-animal"
// import { UseSeedsModule } from "./use-seeds"

@Module({
    imports: [
        UseWateringCanModule,
        UseFertilizerModule,
        UseHerbicideModule,
        UsePesticideModule,
        UseAnimalFeedModule,
        UseAnimalMedicineModule,
        HarvestAnimalModule,
        // HarvestFruitModule,
        // UseBugNetModule,
        // UseFruitFertilizerModule,
    ]
})
export class FarmingModule {} 