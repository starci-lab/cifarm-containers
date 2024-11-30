import { Module } from "@nestjs/common"
import { FollowModule } from "@apps/gameplay-service/src/community/follow/follow.module"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterModule } from "./help-water"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { TheifCropModule } from "./theif-crop"

@Module({
    imports: [
        FollowModule,
        HelpCureAnimalModule,
        HelpWaterModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        TheifCropModule
    ]
})
export class CommunityModule {}
