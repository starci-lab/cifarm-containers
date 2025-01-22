import { Module } from "@nestjs/common"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"

@Module({
    providers: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}
