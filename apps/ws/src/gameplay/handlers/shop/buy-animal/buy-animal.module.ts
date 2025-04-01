import { Module } from "@nestjs/common"
import { BuyAnimalService } from "./buy-animal.service"
import { BuyAnimalGateway } from "./buy-animal.gateway"

@Module({
    providers: [BuyAnimalService, BuyAnimalGateway],
})
export class BuyAnimalModule {} 