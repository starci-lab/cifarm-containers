import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
import { CommunityModule } from "./community"
import { InventoriesModule } from "./inventories"
import { ClaimModule } from "./claim"
import { ActionsModule } from "./actions"
import { PlacementModule } from "./placement"
import { NFTModule } from "./nft"
import { PlayerModule } from "./player"

@Module({
    imports: [
        FarmingModule,
        ShopModule,
        CommunityModule,
        InventoriesModule,
        ClaimModule,
        ActionsModule,
        PlacementModule,
        NFTModule,
        PlayerModule
    ]
})
export class HandlersModule {}
