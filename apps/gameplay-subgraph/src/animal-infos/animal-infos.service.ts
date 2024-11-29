import { GetAnimalInfosArgs } from "./"
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
            animalInfos = await queryRunner.manager.find(AnimalInfoEntity, {
                take: limit,
                skip: offset,
                relations: {
                    animal: true,
                    placedItem: true,
                    thiefedBy: true,
                }
            })
            return animalInfos
        } finally {
            await queryRunner.release()
        }
    }
}
