import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { DailyRewardsService } from "./daily-rewards.service"
import { DailyRewardEntity } from "@src/database"
import { GetDailyRewardsArgs } from "./daily-rewards.dto"

@Resolver()
export class DailyRewardsResolver {
    private readonly logger = new Logger(DailyRewardsResolver.name)

    constructor(private readonly dailyRewardsService: DailyRewardsService) {}

  @Query(() => [DailyRewardEntity], {
      name: "dailyRewards",
  })
    async getDailyRewards(@Args("args") args: GetDailyRewardsArgs): Promise<Array<DailyRewardEntity>> {
        return this.dailyRewardsService.getDailyRewards(args)
    } 
}
