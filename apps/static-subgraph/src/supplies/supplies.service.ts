import { Injectable, Logger, Inject } from "@nestjs/common"
import { SupplyEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSuppliesArgs } from "./supplies.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getSupplies({ limit = 10, offset = 0 }: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        this.logger.debug(`GetSupplies: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<SupplyEntity>>(REDIS_KEY.SUPPLIES)
        let supplies: Array<SupplyEntity>

        if (cachedData) {
            this.logger.debug("GetSupplies: Returning data from cache")
            supplies = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetSupplies: From Database")
            supplies = await this.dataSource.manager.find(SupplyEntity)

            await this.cacheManager.set(REDIS_KEY.SUPPLIES, supplies)

            supplies = supplies.slice(offset, offset + limit)
        }

        return supplies
    }
}
