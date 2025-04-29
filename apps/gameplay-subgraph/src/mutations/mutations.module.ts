import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
import { CommunityModule } from "./community"
import { SolanaModule } from "./solana"

@Module({
    imports: [
        AuthModule,
        PlayerModule,
        HoneycombModule,
        CommunityModule,
        SolanaModule
    ]
})
export class MutationsModule {}
