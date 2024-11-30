import { GetDailyRewardPossibilitiesArgs } from "./"
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
            dailyRewards = await queryRunner.manager.find(DailyRewardPossibilityEntity, {
                take: limit,
<<<<<<< HEAD:apps/gameplay-subgraph/src/daily-reward-possibilities/daily-reward-possibilities.service.ts
                skip: offset,
                relations: {
                    dailyReward: true,
                }
=======
                skip: offset
>>>>>>> f9c45204f39ad3d2d2a36bea9f7f920c9ee7c2fd:apps/static-subgraph/src/daily-reward-possibilities/daily-reward-possibilities.service.ts
            })
            return dailyRewards
        } finally {
            await queryRunner.release()
        }
    }
}
