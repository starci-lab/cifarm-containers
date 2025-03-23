import { Module } from "@nestjs/common"
import { BuyCropSeedsResolver } from "./buy-crop-seeds.resolver"
import { BuyCropSeedsService } from "./buy-crop-seeds.service"

@Module({
    providers: [BuyCropSeedsService, BuyCropSeedsResolver]
})
export class BuyCropSeedsModule {}
