import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpUseWateringCanModule } from "./help-use-watering-can"
import { HelpUseAnimalMedicineModule } from "./help-use-animal-medicine"
import { ThiefPlantModule } from "./thief-plant"
import { ThiefAnimalModule } from "./thief-animal"
import { HelpUseBugNetModule } from "./help-use-bug-net"
import { ThiefFruitModule } from "./thief-fruit"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        HelpUseAnimalMedicineModule,
        HelpUseWateringCanModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        ThiefPlantModule,
        ThiefAnimalModule,
        HelpUseBugNetModule,    
        ThiefFruitModule
    ]
})
export class CommunityModule {}
