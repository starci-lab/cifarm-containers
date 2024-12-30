import { Module } from "@nestjs/common"
import { DailyRewardsResolver } from "./daily-rewards.resolver"
import { DailyRewardsService } from "./daily-rewards.service"
 

@Module({
    imports: [ ],
    providers: [DailyRewardsService, DailyRewardsResolver]
})
export class DailyRewardsModule {}
