import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterCropModule } from "./help-water-crop"
import { ThiefPlantModule } from "./thief-plant"
import { ThiefAnimalModule } from "./thief-animal"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpUseBugNetModule } from "./help-use-bug-net"
import { ThiefFruitModule } from "./thief-fruit"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        HelpCureAnimalModule,
        HelpWaterCropModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        ThiefPlantModule,
        ThiefAnimalModule,
        HelpUseBugNetModule,    
        ThiefFruitModule
    ]
})
export class CommunityModule {}
