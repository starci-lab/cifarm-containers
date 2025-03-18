import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"
import { VisitModule } from "./visit"
import { ReturnModule } from "./return"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterCropModule } from "./help-water-crop"
import { ThiefCropModule } from "./thief-crop"
import { ThiefAnimalProductModule } from "./thief-animal-product"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpUseBugNetModule } from "./help-use-bug-net"
import { ThiefFruitModule } from "./thief-fruit"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        VisitModule,
        ReturnModule,
        HelpCureAnimalModule,
        HelpWaterCropModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        ThiefCropModule,
        ThiefAnimalProductModule,
        HelpUseBugNetModule,    
        ThiefFruitModule
    ]
})
export class CommunityModule {}
