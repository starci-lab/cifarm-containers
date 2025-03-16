import { Module } from "@nestjs/common"
import { ClaimDailyRewardResolver } from "./claim-daily-reward.resolver"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

@Module({
    providers: [ClaimDailyRewardService, ClaimDailyRewardResolver],
})
export class ClaimDailyRewardModule {}
