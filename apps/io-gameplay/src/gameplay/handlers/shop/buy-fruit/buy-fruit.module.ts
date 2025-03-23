import { Module } from "@nestjs/common"
import { BuyFruitGateway } from "./buy-fruit.gateway"
import { BuyFruitService } from "./buy-fruit.service"

@Module({
    providers: [BuyFruitService, BuyFruitGateway],
})
export class BuyFruitModule {}
