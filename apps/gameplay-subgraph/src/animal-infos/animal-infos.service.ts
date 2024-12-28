import { GetAnimalInfosArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { AnimalInfoEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfosService {
   
    private readonly logger = new Logger(AnimalInfosService.name)

    private readonly relations = {
        animal: true,
        placedItem: true,
        thiefedBy: true,
    }

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
                relations: this.relations
            })
            return animalInfos
        } finally {
            await queryRunner.release()
        }
    }
    async getAnimalInfoById(id: string) {
        this.logger.debug(`GetAnimalInfos: id=${id}`)

        let animalInfo: AnimalInfoEntity
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            animalInfo = await queryRunner.manager.findOne(AnimalInfoEntity, {
                where: { id },
                relations:this.relations
            })
            return animalInfo
        } finally {
            await queryRunner.release()
        }
    }
}
