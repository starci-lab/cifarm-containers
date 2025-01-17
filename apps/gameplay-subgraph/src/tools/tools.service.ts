import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, ToolEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) { }

    async getTool(id: string): Promise<ToolEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, ToolEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getTools(): Promise<Array<ToolEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, ToolEntity)
        } finally {
            await queryRunner.release()
        }
    }
}
