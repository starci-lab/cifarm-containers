import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
import { CommunityModule } from "./community"
import { NFTsModule } from "./nfts"
import { WholesaleMarketModule } from "./wholesale-market"

@Module({
    imports: [
        AuthModule,
        PlayerModule,
        HoneycombModule,
        CommunityModule,
        NFTsModule,
        WholesaleMarketModule
    ]
})
export class MutationsModule {}
