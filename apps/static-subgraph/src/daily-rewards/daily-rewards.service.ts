import { Injectable, Logger } from "@nestjs/common"
import { DailyRewardEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetDailyRewardsArgs } from "./daily-rewards.dto"

@Injectable()
export class DailyRewardsService {
    private readonly logger = new Logger(DailyRewardsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getDailyRewards({
        limit = 10,
        offset = 0
    }: GetDailyRewardsArgs): Promise<Array<DailyRewardEntity>> {
        this.logger.debug(`GetDailyRewards: limit=${limit}, offset=${offset}`)

        let dailyRewards: Array<DailyRewardEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            dailyRewards = await this.dataSource.getRepository(DailyRewardEntity).find({
                take: limit,
                skip: offset,
                relations: ["dailyRewardPossibilities"]
            })
            return dailyRewards
        } finally {
            await queryRunner.release()
        }
    }
}
