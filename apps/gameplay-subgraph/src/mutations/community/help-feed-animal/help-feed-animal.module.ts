import { Module } from "@nestjs/common"
import { HelpFeedAnimalController } from "./help-feed-animal.resolver"
import { HelpFeedAnimalService } from "./help-feed-animal.service"

 
@Module({
    providers: [HelpFeedAnimalService],
    controllers: [HelpFeedAnimalController]
})
export class HelpFeedAnimalModule {}
