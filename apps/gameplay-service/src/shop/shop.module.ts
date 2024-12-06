import { Module } from "@nestjs/common"
import { BuySeedsModule } from "./buy-seeds"
import { BuySuppliesModule } from "./buy-supplies"
import { ConstructBuildingModule } from "./construct-building"
import { BuyAnimalModule } from "./buy-animal"
import { BuyTileModule } from "./buy-tile"

@Module({
    imports: [
        ConstructBuildingModule,
        BuySeedsModule,
        BuySuppliesModule,
        BuyAnimalModule,
        BuyTileModule
    ]
})
export class ShopModule {}
