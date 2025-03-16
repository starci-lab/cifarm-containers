import { Module } from "@nestjs/common"
import { HelpFeedAnimalResolver } from "./help-feed-animal.resolver"
import { HelpFeedAnimalService } from "./help-feed-animal.service"

 
@Module({
    providers: [HelpFeedAnimalService, HelpFeedAnimalResolver]
})
export class HelpFeedAnimalModule {}
