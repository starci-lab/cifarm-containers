import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { FeedAnimalController } from "./feed-animal.controller"
import { FeedAnimalService } from "./feed-animal.service"

 
@Module({
    imports: [GameplayModule],
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService],
    exports: [FeedAnimalService]
})
export class FeedAnimalModule {}
