import { Module } from "@nestjs/common"
import { BuyFruitController } from "./buy-fruit.controller"
import { BuyFruitService } from "./buy-fruit.service"

@Module({
    controllers: [BuyFruitController],
    providers: [BuyFruitService],
})
export class BuyFruitModule {}
