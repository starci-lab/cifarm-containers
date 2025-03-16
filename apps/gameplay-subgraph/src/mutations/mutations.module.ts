import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { CommunityModule } from "./community"
import { ClaimModule } from "./claim"
import { DeliveryModule } from "./delivery"
import { FarmingModule } from "./farming"
import { HoneycombModule } from "./honeycomb"
import { ShopModule } from "./shop"
import { UpgradeModule } from "./upgrade"
import { PlayerModule } from "./player"
import { PlacementModule } from "./placement"

@Module({
    imports: [
        AuthModule,
        // CommunityModule,
        ClaimModule,
        // DeliveryModule,
        // FarmingModule,
        // UpgradeModule,
        // ShopModule,
        // HoneycombModule,
        // PlayerModule,
        // PlacementModule
    ]
})
export class MutationsModule {}
