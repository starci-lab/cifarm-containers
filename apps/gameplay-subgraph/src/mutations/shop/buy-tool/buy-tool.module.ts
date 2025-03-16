import { Module } from "@nestjs/common"
import { BuyToolResolver } from "./buy-tool.resolver"
import { BuyToolService } from "./buy-tool.service"

@Module({
    providers: [BuyToolService, BuyToolResolver]
})
export class BuyToolModule {}
