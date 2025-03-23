import { Module } from "@nestjs/common"
import { BuyCropSeedsModule } from "./buy-crop-seeds"
import { BuyFlowerSeedsModule } from "./buy-flower-seeds"

@Module({
    imports: [BuyCropSeedsModule, BuyFlowerSeedsModule ],
})
export class ShopModule {}