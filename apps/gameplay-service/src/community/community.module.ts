import { Module } from "@nestjs/common"
import { FollowModule } from "@apps/gameplay-service/src/community/follow/follow.module"
//import { HelpCureAnimalModule } from "./help-cure-animal"
//import { HelpWaterModule } from "./help-water"

@Module({
    imports: [
        FollowModule
        //HelpCureAnimalModule,
        //HelpWaterModule
    ]
})
export class CommunityModule {}
