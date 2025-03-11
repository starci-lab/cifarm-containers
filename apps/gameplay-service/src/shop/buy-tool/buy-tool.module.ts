import { Module } from "@nestjs/common"
import { BuyToolController } from "./buy-tool.controller"
import { BuyToolService } from "./buy-tool.service"

@Module({
    controllers: [BuyToolController],
    providers: [BuyToolService]
})
export class BuyToolModule {}
