import { DailyRewardPossibilitiesResolver } from "@apps/gameplay-subgraph/src/daily-reward-possibilities/daily-reward-possibilities.resolver"
import { DailyRewardPossibilitiesService } from "@apps/gameplay-subgraph/src/daily-reward-possibilities/daily-reward-possibilities.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [DailyRewardPossibilitiesService, DailyRewardPossibilitiesResolver]
})
export class DailyRewardPossibilitiesModule { }
