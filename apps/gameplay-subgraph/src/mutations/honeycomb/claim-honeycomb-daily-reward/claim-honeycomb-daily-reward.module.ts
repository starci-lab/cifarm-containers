import { Module } from "@nestjs/common"
import { ClaimHoneycombDailyRewardService } from "./claim-honeycomb-daily-reward.service"
import { ClaimHoneycombDailyRewardResolver } from "./claim-honeycomb-daily-reward.resolver"

@Module({
    providers: [ClaimHoneycombDailyRewardService, ClaimHoneycombDailyRewardResolver],
})
export class ClaimHoneycombDailyRewardModule {}
