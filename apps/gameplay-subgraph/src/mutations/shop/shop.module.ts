import { Module } from "@nestjs/common"
import { BuyCropSeedsModule } from "./buy-crop-seeds"
import { BuyFlowerSeedsModule } from "./buy-flower-seeds"
import { BuySuppliesModule } from "./buy-supplies"
import { BuyBuildingModule } from "./buy-building"
import { BuyAnimalModule } from "./buy-animal"
import { BuyTileModule } from "./buy-tile"
import { BuyToolModule } from "./buy-tool"
import { BuyFruitModule } from "./buy-fruit"

@Module({
    imports: [
        BuyBuildingModule,
        BuyFruitModule,
        BuyCropSeedsModule,
        BuyFlowerSeedsModule,
        BuySuppliesModule,
        BuyAnimalModule,
        BuyTileModule,
        BuyToolModule
    ]
})
export class ShopModule {}
