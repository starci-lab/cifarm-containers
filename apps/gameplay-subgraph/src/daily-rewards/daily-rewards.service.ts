import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, DailyRewardEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class DailyRewardsService {
    private readonly logger = new Logger(DailyRewardsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) { }

    async getDailyReward(id: string): Promise<DailyRewardEntity> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, DailyRewardEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getDailyRewards(): Promise<Array<DailyRewardEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, DailyRewardEntity)
        } finally {
            await queryRunner.release()
        }
    }
}
