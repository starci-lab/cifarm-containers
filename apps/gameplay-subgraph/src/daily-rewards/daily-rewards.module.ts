import { Module } from "@nestjs/common"
import { DailyRewardsResolver } from "./daily-rewards.resolver"
import { DailyRewardsService } from "./daily-rewards.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [DailyRewardsService, DailyRewardsResolver]
})
export class DailyRewardsModule {}