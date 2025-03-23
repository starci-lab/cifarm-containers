import { Module } from "@nestjs/common"
import { UseAnimalFeedResolver } from "./use-animal-feed.resolver"
import { UseAnimalFeedService } from "./use-animal-feed.service"

 
@Module({
    providers: [UseAnimalFeedService, UseAnimalFeedResolver]
})
export class UseAnimalFeedModule {}
