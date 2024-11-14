import { Injectable, Logger, Inject } from "@nestjs/common"
import { SpinEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSpinsArgs } from "./spins.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getSpins({ limit = 10, offset = 0 }: GetSpinsArgs): Promise<Array<SpinEntity>> {
        this.logger.debug(`GetSpins: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<SpinEntity>>(REDIS_KEY.SPINS)
        let spins: Array<SpinEntity>

        if (cachedData) {
            this.logger.debug("GetSpins: Returning data from cache")
            spins = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetSpins: From Database")
            spins = await this.dataSource.manager.find(SpinEntity)

            await this.cacheManager.set(REDIS_KEY.SPINS, spins)

            spins = spins.slice(offset, offset + limit)
        }

        return spins
    }
}
