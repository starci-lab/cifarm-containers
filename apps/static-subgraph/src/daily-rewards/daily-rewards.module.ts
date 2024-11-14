import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DailyRewardEntity, DailyRewardPossibility } from "@src/database"
import { DailyRewardsResolver } from "./daily-rewards.resolver"
import { DailyRewardsService } from "./daily-rewards.service"

@Module({
    imports: [TypeOrmModule.forFeature([DailyRewardEntity, DailyRewardPossibility])],
    providers: [DailyRewardsService, DailyRewardsResolver]
})
export class DailyRewardsModule {}
