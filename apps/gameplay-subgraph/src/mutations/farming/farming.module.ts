import { Module } from "@nestjs/common"
import { HarvestPlantModule } from "./harvest-plant"
import { PlantSeedModule } from "./plant-seed"
import { UseHerbicideModule } from "./use-herbicide"
import { UsePesticideModule } from "./use-pesticide"
import { HarvestAnimalModule } from "./harvest-animal"
import { UseAnimalFeedModule } from "./use-animal-feed"
import { UseAnimalMedicineModule } from "./use-animal-medicine"
import { UseFertilizerModule } from "./use-fertilizer"
import { UseWateringCanModule } from "./use-watering-can"
import { HarvestFruitModule } from "./harvest-fruit"
import { UseBugNetModule } from "./use-bug-net"
import { UseFruitFertilizerModule } from "./use-fruit-fertilizer"

@Module({
    imports: [
        HarvestAnimalModule,
        UseAnimalMedicineModule,
        UseAnimalFeedModule,
        HarvestPlantModule,
        PlantSeedModule,
        UseFertilizerModule,
        UseHerbicideModule,
        UsePesticideModule,
        UseWateringCanModule,
        HarvestFruitModule,
        UseBugNetModule,
        UseFruitFertilizerModule
    ]
})
export class FarmingModule {}
