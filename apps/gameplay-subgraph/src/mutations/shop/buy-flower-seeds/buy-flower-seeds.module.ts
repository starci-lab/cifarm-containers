import { Module } from "@nestjs/common"
import { BuyFlowerSeedsResolver } from "./buy-flower-seeds.resolver"
import { BuyFlowerSeedsService } from "./buy-flower-seeds.service"

@Module({
    providers: [BuyFlowerSeedsService, BuyFlowerSeedsResolver]
})
export class BuyFlowerSeedsModule {}
