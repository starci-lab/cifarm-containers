import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, InjectPostgreSQL, CacheQueryRunnerService } from "@src/databases"
import { DataSource, FindManyOptions, FindOptionsRelations } from "typeorm"
import { GetBuildingsArgs } from "./buildings.dto"

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

    async getBuildings({
        limit = 10,
        offset = 0
    }: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        this.logger.debug(`GetBuildings: limit=${limit}, offset=${offset}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const options: FindManyOptions<BuildingEntity> = {
                take: limit,
                skip: offset,
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
