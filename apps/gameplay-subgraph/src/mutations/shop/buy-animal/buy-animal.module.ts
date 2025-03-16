import { Module } from "@nestjs/common"
import { BuyAnimalResolver } from "./buy-animal.resolver"
import { BuyAnimalService } from "./buy-animal.service"

@Module({
    providers: [BuyAnimalService, BuyAnimalResolver]
})
export class BuyAnimalModule {}
