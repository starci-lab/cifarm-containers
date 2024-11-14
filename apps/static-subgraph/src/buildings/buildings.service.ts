import { Injectable, Logger, Inject } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetBuildingsArgs } from "./buildings.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getBuildings({
        limit = 10,
        offset = 0
    }: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        this.logger.debug(`GetBuildings: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<BuildingEntity>>(REDIS_KEY.BUILDINGS)
        let buildings: Array<BuildingEntity>

        if (cachedData) {
            this.logger.debug("GetBuildings: Returning data from cache")
            buildings = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetBuildings: From Database")
            buildings = await this.dataSource.manager.find(BuildingEntity)

            await this.cacheManager.set(REDIS_KEY.BUILDINGS, buildings)

            buildings = buildings.slice(offset, offset + limit)
        }

        return buildings
    }
}
