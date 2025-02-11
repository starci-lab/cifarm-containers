import { Module } from "@nestjs/common"
import { DailyRewardsResolver } from "./daily-rewards.resolver"
import { DailyRewardsService } from "./daily-rewards.service"

@Module({
    providers: [DailyRewardsService, DailyRewardsResolver]
})
export class DailyRewardsModule {}
