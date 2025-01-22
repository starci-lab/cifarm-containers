import { Module } from "@nestjs/common"
import { ClaimDailyRewardSpinController } from "./claim-daily-reward.controller"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

@Module({
    providers: [ClaimDailyRewardService],
    controllers: [ClaimDailyRewardSpinController]
})
export class ClaimDailyRewardModule {}
