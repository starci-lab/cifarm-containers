import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, InjectPostgreSQL, PostgreSQLCacheKeyService, PostgreSQLCacheKeyType } from "@src/databases"
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
        private readonly postgreSqlCacheKeyService: PostgreSQLCacheKeyService
    ) { }

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
            
            return await queryRunner.manager.find(BuildingEntity, {
                ...options,
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: BuildingEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Pagination,
                            options
                        }
                    }),
                    milliseconds: 0
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getBuildingById(id: string): Promise<BuildingEntity> {
        this.logger.debug(`GetBuildingById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(BuildingEntity, {
                where: { id },
                relations: this.relations,
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: BuildingEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id
                        }
                    }),
                    milliseconds: 0
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
