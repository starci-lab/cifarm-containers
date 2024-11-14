import { Injectable, Logger, Inject } from "@nestjs/common"
import { CropEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetCropsArgs } from "./crops.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getCrops({ limit = 10, offset = 0 }: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`GetCrops: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<CropEntity>>(REDIS_KEY.CROPS)
        let crops: Array<CropEntity>

        if (cachedData) {
            this.logger.debug("GetCrops: Returning data from cache")
            crops = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetCrops: From Database")
            crops = await this.dataSource.manager.find(CropEntity)

            await this.cacheManager.set(REDIS_KEY.CROPS, crops)

            crops = crops.slice(offset, offset + limit)
        }

        return crops
    }
}
