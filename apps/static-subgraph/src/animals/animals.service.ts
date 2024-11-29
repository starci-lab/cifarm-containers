import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getAnimals({ limit = 10, offset = 0 }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)

        let animals: Array<AnimalEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animals = await queryRunner.manager.find(AnimalEntity, {
                take: limit,
                skip: offset,
                relations: {
                    product: true
                }
            })
        } finally {
            await queryRunner.release()
        }
        return animals
    }
}
