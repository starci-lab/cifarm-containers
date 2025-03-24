import { Module } from "@nestjs/common"
import { UseAnimalFeedService } from "./use-animal-feed.service"
import { UseAnimalFeedGateway } from "./use-animal-feed.gateway"

@Module({
    providers: [UseAnimalFeedService, UseAnimalFeedGateway]
})
export class UseAnimalFeedModule {} 