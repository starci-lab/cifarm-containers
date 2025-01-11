import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity, InjectPostgreSQL, CacheQueryRunnerService } from "@src/databases"
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
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getAnimals({ limit = 10, offset = 0 }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const options: FindManyOptions<AnimalEntity> = {
                take: limit,
                skip: offset,
                relations: this.relations
            }

            return await this.cacheQueryRunnerService.find(
                queryRunner,
                AnimalEntity,
                options
            )
        } finally {
            await queryRunner.release()
        }
    }

    async getAnimal(id: string) {
        this.logger.debug(`GetAnimals: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, AnimalEntity, {
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
