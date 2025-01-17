import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CacheQueryRunnerService, InjectPostgreSQL, UpgradeEntity } from "@src/databases"

@Injectable()
export class UpgradeService {
    private readonly logger = new Logger(UpgradeService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) { }

    async getUpgrade(id: string): Promise<UpgradeEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, UpgradeEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getUpgrades(): Promise<Array<UpgradeEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, UpgradeEntity)
        } finally {
            await queryRunner.release()
        }
    }
}
    
