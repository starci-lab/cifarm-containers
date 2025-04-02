import { Module } from "@nestjs/common"
import { BuyCropSeedsModule } from "./buy-crop-seeds"
import { BuyFlowerSeedsModule } from "./buy-flower-seeds"
import { BuySuppliesModule } from "./buy-supplies"
import { BuyToolModule } from "./buy-tool"
import { BuyFruitModule } from "./buy-fruit"
import { BuyTileModule } from "./buy-tile"
import { BuyAnimalModule } from "./buy-animal"
import { BuyBuildingModule } from "./buy-building"
import { BuyPetModule } from "./buy-pet"

@Module({
    imports: [
        BuyCropSeedsModule,
        BuyFlowerSeedsModule,
        BuySuppliesModule,
        BuyToolModule,
        BuyFruitModule,
        BuyTileModule,
        BuyAnimalModule,
        BuyBuildingModule,
        BuyPetModule
    ]
})
export class ShopModule {}
