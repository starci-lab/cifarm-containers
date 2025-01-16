import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity, InjectPostgreSQL, CacheQueryRunnerService } from "@src/databases"
import { DataSource, FindManyOptions, FindOptionsRelations } from "typeorm"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    private readonly relations: FindOptionsRelations<AnimalEntity> = {
        placedItemType: true,
        product: true,
        inventoryType: true,
    }

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getAnimals(): Promise<Array<AnimalEntity>> {
        this.logger.debug("GetAnimals") 

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const options: FindManyOptions<AnimalEntity> = {
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
            })
        } finally {
            await queryRunner.release()
        }
    }
}
