import { Module } from "@nestjs/common"
import { BuyDecorationService } from "./buy-decoration.service"
import { BuyDecorationGateway } from "./buy-decoration.gateway"

@Module({
    providers: [BuyDecorationService, BuyDecorationGateway]
})
export class BuyDecorationModule {}
