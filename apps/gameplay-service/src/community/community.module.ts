import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"
import { VisitModule } from "./visit"
import { ReturnModule } from "./return"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
        VisitModule,
        ReturnModule
        // HelpCureAnimalModule,
        // HelpWaterModule,
        // HelpUsePesticideModule,
        // HelpUseHerbicideModule,
        // ThiefCropModule,
        // ThiefAnimalProductModule
    ]
})
export class CommunityModule {}
