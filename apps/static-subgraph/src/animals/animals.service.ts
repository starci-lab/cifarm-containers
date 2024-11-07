import { Injectable, Logger } from "@nestjs/common"
import { AnimalEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getAnimals({
        limit = 10,
        offset = 0,
    }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(AnimalEntity, {
            take: limit,
            skip: offset,
        })
    }
}
