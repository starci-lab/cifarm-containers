import { Module } from "@nestjs/common"
import { BuySeedsResolver } from "./buy-seeds.resolver"
import { BuySeedsService } from "./buy-seeds.service"

@Module({
    providers: [BuySeedsService, BuySeedsResolver]
})
export class BuySeedsModule {}
