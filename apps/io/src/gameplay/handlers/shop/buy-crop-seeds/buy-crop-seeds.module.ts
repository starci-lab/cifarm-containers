import { Module } from "@nestjs/common"
import { BuyCropSeedsService } from "./buy-crop-seeds.service"
import { BuyCropSeedsGateway } from "./buy-crop-seeds.gateway"

@Module({
    providers: [BuyCropSeedsService, BuyCropSeedsGateway],
})
export class BuyCropSeedsModule {}
