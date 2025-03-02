import { Module } from "@nestjs/common"
import { ClaimHoneycombDailyRewardModule } from "./claim-honeycomb-daily-reward"

@Module({
    imports: [ClaimHoneycombDailyRewardModule]
})
export class HoneycombModule {}
