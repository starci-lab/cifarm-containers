import { Module } from "@nestjs/common"
import { BuySeedsModule } from "./buy-seeds"
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
        BuySeedsModule,
        BuySuppliesModule,
        BuyAnimalModule,
        BuyTileModule,
        BuyToolModule
    ]
})
export class ShopModule {}
