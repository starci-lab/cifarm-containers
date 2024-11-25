import { Injectable, Logger, Inject } from "@nestjs/common"
import { AnimalEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getAnimals({ limit = 10, offset = 0 }: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        this.logger.debug(`GetAnimals: limit=${limit}, offset=${offset}`)

        let animals: Array<AnimalEntity>

        return animals
    }
}
