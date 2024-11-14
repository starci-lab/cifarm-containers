import { Injectable, Logger, Inject } from "@nestjs/common"
import { AnimalEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetAnimalsArgs } from "./animals.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

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

        const cachedData = await this.cacheManager.get<Array<AnimalEntity>>(REDIS_KEY.ANIMALS)
        let animals: Array<AnimalEntity>

        if (cachedData) {
            this.logger.debug("GetAnimals: Returning data from cache")
            animals = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetAnimals: From Database")
            animals = await this.dataSource.manager.find(AnimalEntity)

            await this.cacheManager.set(REDIS_KEY.ANIMALS, animals)

            animals = animals.slice(offset, offset + limit)
        }

        return animals
    }
}
