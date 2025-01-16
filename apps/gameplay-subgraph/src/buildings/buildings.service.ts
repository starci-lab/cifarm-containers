import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, InjectPostgreSQL, CacheQueryRunnerService } from "@src/databases"
import { DataSource, FindManyOptions, FindOptionsRelations } from "typeorm"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    private readonly relations: FindOptionsRelations<BuildingEntity> = {
        placedItemType: true,
        upgrades: true
    }

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getBuildings(): Promise<Array<BuildingEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const options: FindManyOptions<BuildingEntity> = {
                relations: this.relations
            }

            return await this.cacheQueryRunnerService.find(
                queryRunner,
                BuildingEntity,
                options
            )
        } finally {
            await queryRunner.release()
        }
    }

    async getBuildingById(id: string): Promise<BuildingEntity> {
        this.logger.debug(`GetBuildingById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, BuildingEntity, {
                where: {
                    id
                },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }
}
