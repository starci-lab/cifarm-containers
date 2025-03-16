import { Module } from "@nestjs/common"
import { FeedAnimalResolver } from "./feed-animal.resolver"
import { FeedAnimalService } from "./feed-animal.service"

 
@Module({
    providers: [FeedAnimalService, FeedAnimalResolver]
})
export class FeedAnimalModule {}
