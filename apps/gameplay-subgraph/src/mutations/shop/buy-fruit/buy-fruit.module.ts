import { Module } from "@nestjs/common"
import { BuyFruitResolver } from "./buy-fruit.resolver"
import { BuyFruitService } from "./buy-fruit.service"

@Module({
    providers: [BuyFruitService, BuyFruitResolver],
})
export class BuyFruitModule {}
