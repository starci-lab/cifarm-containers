import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, SpinPrizeEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class SpinPrizesService {
    private readonly logger = new Logger(SpinPrizesService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getSpinPrizes(): Promise<Array<SpinPrizeEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, SpinPrizeEntity)
        } finally {
            await queryRunner.release()
        }
    }

    async getSpinPrize(id: string): Promise<SpinPrizeEntity> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, SpinPrizeEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
