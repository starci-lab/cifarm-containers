import { Injectable, Logger } from "@nestjs/common"
import {
    AnimalEntity,
    InjectPostgreSQL,
    PostgreSQLCacheKeyService,
    PostgreSQLCacheKeyType
} from "@src/databases"
import { DataSource, FindManyOptions, FindOptionsRelations } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    private readonly relations: FindOptionsRelations<AnimalEntity> = {
        product: true,
        inventoryType: true,
        placedItemType: true
    }

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly postgreSqlCacheKeyService: PostgreSQLCacheKeyService
    ) {}

    async getAnimals({ limit = 10, offset = 0 }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)

        let animals: Array<AnimalEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const options : FindManyOptions<AnimalEntity> = {
                take: limit,
                skip: offset,
                relations: this.relations,
            }

            animals = await queryRunner.manager.find(AnimalEntity, {
                ...options,
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: AnimalEntity,
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
        return animals
    }

    async getAnimal(id: string) {
        this.logger.debug(`GetAnimals: id=${id}`)

        let animal: AnimalEntity
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animal = await queryRunner.manager.findOne(AnimalEntity, {
                where: {
                    id
                },
                relations: this.relations,
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: AnimalEntity,
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
        return animal
    }
}
