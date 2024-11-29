import { GetAnimalInfosArgs } from "@apps/static-subgraph/src/animal-infos/animal-infos.dto"
import { Injectable, Logger } from "@nestjs/common"
import { AnimalInfoEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfosService {
    private readonly logger = new Logger(AnimalInfosService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getAnimalInfos({ limit = 10, offset = 0 }: GetAnimalInfosArgs): Promise<Array<AnimalInfoEntity>> {
        this.logger.debug(`GetAnimalInfos: limit=${limit}, offset=${offset}`)

        let animalInfos: Array<AnimalInfoEntity> 
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animalInfos = await this.dataSource.getRepository(AnimalInfoEntity).find({
                take: limit,
                skip: offset,
                relations: ["placedItem","animal","thiefedBy"]
            })
            return animalInfos
        } finally {
            await queryRunner.release()
        }
    }
}
