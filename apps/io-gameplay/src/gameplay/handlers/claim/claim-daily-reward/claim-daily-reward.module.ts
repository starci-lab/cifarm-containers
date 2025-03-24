import { Module } from "@nestjs/common"
import { ClaimDailyRewardGateway } from "./claim-daily-reward.gateway"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

@Module({
    providers: [ClaimDailyRewardService, ClaimDailyRewardGateway],
})
export class ClaimDailyRewardModule {}
