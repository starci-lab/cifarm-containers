import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, InventoryTypeEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryTypesService {
    private readonly logger = new Logger(InventoryTypesService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getInventoryTypes(): Promise<Array<InventoryTypeEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, InventoryTypeEntity)
        } finally {
            await queryRunner.release()
        }
    }

    async getInventoryType(id: string): Promise<InventoryTypeEntity> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, InventoryTypeEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
