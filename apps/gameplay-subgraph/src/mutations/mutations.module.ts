import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
@Module({
    imports: [
        AuthModule,
        // CommunityModule,
        // ClaimModule,
        // DeliveryModule,
        // FarmingModule,
        // UpgradeModule,
        // ShopModule,
        HoneycombModule,
        PlayerModule,
        // PlacementModule
    ]
})
export class MutationsModule {}
