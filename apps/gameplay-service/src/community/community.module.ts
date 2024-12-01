import { Module } from "@nestjs/common"
import { FollowModule } from "./follow/follow.module"
import { HelpCureAnimalModule } from "./help-cure-animal"
import { HelpUsePesticideModule } from "./help-use-pesticide"
import { HelpWaterModule } from "./help-water"
import { HelpUseHerbicideModule } from "./help-use-herbicide"
import { TheifCropModule } from "./theif-crop"
import { TheifAnimalProductModule } from "./theif-animal-product"

@Module({
    imports: [
        FollowModule,
        HelpCureAnimalModule,
        HelpWaterModule,
        HelpUsePesticideModule,
        HelpUseHerbicideModule,
        TheifCropModule,
        TheifAnimalProductModule
    ]
})
export class CommunityModule {}
