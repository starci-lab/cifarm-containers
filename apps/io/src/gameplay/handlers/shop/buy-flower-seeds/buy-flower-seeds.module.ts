import { Module } from "@nestjs/common"
import { BuyFlowerSeedsService } from "./buy-flower-seeds.service"
import { BuyFlowerSeedsGateway } from "./buy-flower-seeds.gateway"

@Module({
    providers: [BuyFlowerSeedsService, BuyFlowerSeedsGateway],
})
export class BuyFlowerSeedsModule {}
