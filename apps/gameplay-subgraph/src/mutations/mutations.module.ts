import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
import { CommunityModule } from "./community"
import { NFTModule } from "./nft"

@Module({
    imports: [
        AuthModule,
        PlayerModule,
        HoneycombModule,
        CommunityModule,
        NFTModule
    ]
})
export class MutationsModule {}
