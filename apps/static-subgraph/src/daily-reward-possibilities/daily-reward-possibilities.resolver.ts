import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { DailyRewardPossibilitiesService } from "./daily-reward-possibilities.service"
import { DailyRewardPossibilityEntity } from "@src/database"
import { GetDailyRewardPossibilitiesArgs } from "./daily-reward-possibilities.dto"

@Resolver()
export class DailyRewardPossibilitiesResolver {
    private readonly logger = new Logger(DailyRewardPossibilitiesResolver.name)

    constructor(private readonly dailyRewardsService: DailyRewardPossibilitiesService) {}

    @Query(() => [DailyRewardPossibilityEntity], {
        name: "daily_reward_possibilities"
    })
    async getDailyRewards(
        @Args("args") args: GetDailyRewardPossibilitiesArgs
    ): Promise<Array<DailyRewardPossibilityEntity>> {
        return this.dailyRewardsService.getDailyRewardPossibilities(args)
    }
}
