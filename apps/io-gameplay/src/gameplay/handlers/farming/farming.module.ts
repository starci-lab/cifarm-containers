import { Module } from "@nestjs/common"
import { UseWateringCanModule } from "./use-watering-can"
import { UseFertilizerModule } from "./use-fertilizer"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { UseAnimalFeedModule } from "./use-animal-feed"
import { UseAnimalMedicineModule } from "./use-animal-medicine"
import { HarvestAnimalModule } from "./harvest-animal"
import { HarvestPlantModule } from "./harvest-plant"
import { PlantSeedModule } from "./plant-seed"
import { UseBugNetModule } from "./use-bug-net"
import { UseFruitFertilizerModule } from "./use-fruit-fertilizer"
import { HarvestFruitModule } from "./harvest-fruit"

@Module({
    imports: [
        UseWateringCanModule,
        UseFertilizerModule,
        UseHerbicideModule,
        UsePesticideModule,
        UseAnimalFeedModule,
        UseAnimalMedicineModule,
        HarvestAnimalModule,
        HarvestPlantModule,
        PlantSeedModule,
        UseBugNetModule,
        UseFruitFertilizerModule,
        HarvestFruitModule,
    ]
})
export class FarmingModule {} 