import { Module } from "@nestjs/common"
import { FeedAnimalController } from "./feed-animal.controller"
import { FeedAnimalService } from "./feed-animal.service"

 
@Module({
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService]
})
export class FeedAnimalModule {}
