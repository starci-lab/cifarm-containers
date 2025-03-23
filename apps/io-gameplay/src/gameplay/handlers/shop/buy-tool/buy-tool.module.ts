import { Module } from "@nestjs/common"
import { BuyToolService } from "./buy-tool.service"
import { BuyToolGateway } from "./buy-tool.gateway"

@Module({
    providers: [BuyToolService, BuyToolGateway],
})
export class BuyToolModule {} 