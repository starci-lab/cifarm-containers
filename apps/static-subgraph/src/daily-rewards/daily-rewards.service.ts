import { Inject, Injectable, Logger } from "@nestjs/common"
import { DailyRewardEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetDailyRewardsArgs } from "./daily-rewards.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { REDIS_KEY } from "@src/constants"
import { Cache } from "cache-manager"

@Injectable()
export class DailyRewardsService {
    private readonly logger = new Logger(DailyRewardsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getDailyRewards({
        limit = 10,
        offset = 0
    }: GetDailyRewardsArgs): Promise<Array<DailyRewardEntity>> {
        this.logger.debug(`GetDailyRewards: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<DailyRewardEntity>>(
            REDIS_KEY.DAILY_REWARDS
        )
        let dailyRewards: Array<DailyRewardEntity>

        if (cachedData) {
            this.logger.debug("Returning data from cache")
            dailyRewards = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetDailyRewards from Database")
            dailyRewards = await this.dataSource.manager.find(DailyRewardEntity)

            await this.cacheManager.set(REDIS_KEY.DAILY_REWARDS, dailyRewards)

            dailyRewards = dailyRewards.slice(offset, offset + limit)
        }

        return dailyRewards
    }
}
