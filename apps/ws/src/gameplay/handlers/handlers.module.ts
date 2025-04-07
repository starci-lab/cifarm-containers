import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
import { CommunityModule } from "./community"
import { InventoriesModule } from "./inventories"
import { ClaimModule } from "./claim"
import { ActionsModule } from "./actions"
import { PlacementModule } from "./placement"
import { PlaceNFTModule } from "./nft/place-nft"

@Module({
    imports: [
        FarmingModule,
        ShopModule,
        CommunityModule,
        InventoriesModule,
        ClaimModule,
        ActionsModule,
        PlacementModule,
        PlaceNFTModule
    ]
})
export class HandlersModule {}
