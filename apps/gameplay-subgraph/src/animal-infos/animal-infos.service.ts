import { GetAnimalInfosArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { AnimalInfoEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfosService {
    private readonly logger = new Logger(AnimalInfosService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getAnimalInfos({
        limit = 10,
        offset = 0
    }: GetAnimalInfosArgs): Promise<Array<AnimalInfoEntity>> {
        this.logger.debug(`GetAnimalInfos: limit=${limit}, offset=${offset}`)

        let animalInfos: Array<AnimalInfoEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animalInfos = await queryRunner.manager.find(AnimalInfoEntity, {
                take: limit,
                skip: offset,
<<<<<<< HEAD:apps/gameplay-subgraph/src/animal-infos/animal-infos.service.ts
                relations: {
                    animal: true,
                    placedItem: true,
                    thiefedBy: true,
                }
=======
                relations: ["placedItem", "animal", "thiefedBy"]
>>>>>>> f9c45204f39ad3d2d2a36bea9f7f920c9ee7c2fd:apps/static-subgraph/src/animal-infos/animal-infos.service.ts
            })
            return animalInfos
        } finally {
            await queryRunner.release()
        }
    }
}
