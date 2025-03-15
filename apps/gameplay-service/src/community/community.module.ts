import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"
import { VisitModule } from "./visit"
import { ReturnModule } from "./return"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterModule } from "./help-water"
import { ThiefCropModule } from "./thief-crop"
import { ThiefAnimalProductModule } from "./thief-animal-product"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpFeedAnimalModule } from "./help-feed-animal"
import { HelpUseBugNetModule } from "./help-use-bug-net"
import { HelpUseFruitFertilizerModule } from "./help-use-fruit-fertilizer"
import { ThiefFruitModule } from "./thief-fruit"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        VisitModule,
        ReturnModule,
        HelpCureAnimalModule,
        HelpWaterModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        ThiefCropModule,
        ThiefAnimalProductModule,
        HelpFeedAnimalModule,
        HelpUseBugNetModule,
        HelpUseFruitFertilizerModule,
        ThiefFruitModule
    ]
})
export class CommunityModule {}
