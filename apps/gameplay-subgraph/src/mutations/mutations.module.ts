import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HoneycombModule } from "./honeycomb"
import { PlayerModule } from "./player"
import { CommunityModule } from "./community"
@Module({
    imports: [
        AuthModule,
        PlayerModule,
        HoneycombModule,
        CommunityModule,
    ]
})
export class MutationsModule {}
