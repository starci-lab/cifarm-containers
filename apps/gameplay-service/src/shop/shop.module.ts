import { Module } from "@nestjs/common"
import { BuySeedsModule } from "./buy-seeds"
import { BuySuppliesModule } from "./buy-supplies"
import { ConstructBuildingModule } from "./construct-building"

@Module({
    imports: [ConstructBuildingModule, BuySeedsModule, BuySuppliesModule]
})
export class ShopModule {}
