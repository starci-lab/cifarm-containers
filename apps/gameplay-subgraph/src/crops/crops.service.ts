import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, CropEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getCrops(): Promise<Array<CropEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, CropEntity)
        } finally {
            await queryRunner.release()
        }
    }

    async getCrop(id: string): Promise<CropEntity> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, CropEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
