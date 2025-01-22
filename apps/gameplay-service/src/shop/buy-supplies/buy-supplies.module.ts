import { Module } from "@nestjs/common"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"

@Module({
    providers: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
