import { Injectable, Logger } from "@nestjs/common"
import { DailyRewardEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { GetDailyRewardsArgs } from "./daily-rewards.dto"

@Injectable()
export class DailyRewardsService {
    private readonly logger = new Logger(DailyRewardsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }

    async getDailyReward(id: string): Promise<DailyRewardEntity> {
        this.logger.debug(`GetDailyRewardById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(DailyRewardEntity, {
                where: { id },
                relations: {}
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getDailyRewards({
        limit = 10,
        offset = 0
    }: GetDailyRewardsArgs): Promise<Array<DailyRewardEntity>> {
        this.logger.debug(`GetDailyRewards: limit=${limit}, offset=${offset}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(DailyRewardEntity, {
                take: limit,
                skip: offset,
                relations: {}
            })
        } finally {
            await queryRunner.release()
        }
    }
}
