import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { DailyRewardsService } from "./daily-rewards.service"
import { DailyRewardEntity } from "@src/databases"
import { GetDailyRewardsArgs } from "./"
import { GraphQLCacheInterceptor } from "@src/cache"

@Resolver()
export class DailyRewardsResolver {
    private readonly logger = new Logger(DailyRewardsResolver.name)

    constructor(private readonly dailyRewardsService: DailyRewardsService) {}

    @Query(() => [DailyRewardEntity], {
        name: "daily_rewards"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getDailyRewards(
        @Args("args") args: GetDailyRewardsArgs
    ): Promise<Array<DailyRewardEntity>> {
        return this.dailyRewardsService.getDailyRewards(args)
    }

    @Query(() => DailyRewardEntity, {
        name: "daily_reward",
        nullable:true
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getDailyRewardById(@Args("id") id: string): Promise<DailyRewardEntity> {
        this.logger.debug(`getDailyRewardById: id=${id}`)
        return this.dailyRewardsService.getDailyRewardById(id)
    }
}
