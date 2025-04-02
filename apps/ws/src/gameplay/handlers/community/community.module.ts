import { Module } from "@nestjs/common"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpUseWateringCanModule } from "./help-use-watering-can"
import { ThiefPlantModule } from "./thief-plant"
import { HelpUseAnimalMedicineModule } from "./help-use-animal-medicine"
import { HelpUseBugNetModule } from "./help-use-bug-net"
import { ThiefAnimalModule } from "./thief-animal"
import { ThiefFruitModule } from "./thief-fruit"
import { ThiefBeeHouseModule } from "./thief-bee-house"

@Module({
    imports: [
        HelpUseHerbicideModule,
        HelpUsePesticideModule,
        HelpUseWateringCanModule,
        ThiefPlantModule,
        HelpUseBugNetModule,
        HelpUseAnimalMedicineModule,
        ThiefAnimalModule,
        ThiefFruitModule,
        ThiefBeeHouseModule
    ]
})
export class CommunityModule {} 