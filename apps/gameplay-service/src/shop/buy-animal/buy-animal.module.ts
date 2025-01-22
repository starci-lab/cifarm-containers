import { Module } from "@nestjs/common"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"

@Module({
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService]
})
export class BuyAnimalModule {}
