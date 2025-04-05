import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
import { CommunityModule } from "./community"
import { NFTsModule } from "./nfts"

@Module({
    imports: [
        AuthModule,
        PlayerModule,
        HoneycombModule,
        CommunityModule,
        NFTsModule
    ]
})
export class MutationsModule {}
