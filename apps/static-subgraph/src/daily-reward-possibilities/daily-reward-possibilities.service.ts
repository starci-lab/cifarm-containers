import { GetDailyRewardPossibilitiesArgs } from "@apps/static-subgraph/src/daily-reward-possibilities/daily-reward-possibilities.dto"
import { Injectable, Logger } from "@nestjs/common"
import { DailyRewardPossibilityEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class DailyRewardPossibilitiesService {
    private readonly logger = new Logger(DailyRewardPossibilitiesService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getDailyRewardPossibilities({
        limit = 10,
        offset = 0
    }: GetDailyRewardPossibilitiesArgs): Promise<Array<DailyRewardPossibilityEntity>> {
        this.logger.debug(`GetDailyRewardPossibilities: limit=${limit}, offset=${offset}`)

        let dailyRewards: Array<DailyRewardPossibilityEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            dailyRewards = await this.dataSource.getRepository(DailyRewardPossibilityEntity).find({
                take: limit,
                skip: offset
            })
            return dailyRewards
        } finally {
            await queryRunner.release()
        }
    }
}
