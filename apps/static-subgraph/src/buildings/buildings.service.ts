import { Injectable, Logger, Inject } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetBuildingsArgs } from "./buildings.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

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

        let buildings: Array<BuildingEntity>

        return buildings
    }
}
