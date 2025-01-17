import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CacheQueryRunnerService, InjectPostgreSQL, TileEntity } from "@src/databases"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getTiles(): Promise<Array<TileEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, TileEntity)
        } finally {
            await queryRunner.release()
        }
    }

    async getTile(id: string): Promise<TileEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, TileEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
