import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, SupplyEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getSupply(id: string): Promise<SupplyEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, SupplyEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getSupplies(): Promise<Array<SupplyEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, SupplyEntity)
        } finally {
            await queryRunner.release()
        }
    }
}
