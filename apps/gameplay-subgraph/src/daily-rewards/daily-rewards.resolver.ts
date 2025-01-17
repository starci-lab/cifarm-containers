import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { DailyRewardsService } from "./daily-rewards.service"
import { DailyRewardEntity } from "@src/databases"

@Resolver()
export class DailyRewardsResolver {
    private readonly logger = new Logger(DailyRewardsResolver.name)

    constructor(private readonly dailyRewardsService: DailyRewardsService) {}

    @Query(() => [DailyRewardEntity], {
        name: "dailyRewards"
    })
    async getDailyRewards(): Promise<Array<DailyRewardEntity>> {
        return this.dailyRewardsService.getDailyRewards()
    }

    @Query(() => DailyRewardEntity, {
        name: "dailyReward",
        nullable: true
    })
    async getDailyRewardById(@Args("id", { type: () => ID }) id: string): Promise<DailyRewardEntity> {
        return this.dailyRewardsService.getDailyReward(id)
    }
}
