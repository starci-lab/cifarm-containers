import { Inject, Injectable, Logger } from "@nestjs/common"
import { DailyRewardEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetDailyRewardsArgs } from "./daily-rewards.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
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

        let dailyRewards: Array<DailyRewardEntity>

        return dailyRewards
    }
}
