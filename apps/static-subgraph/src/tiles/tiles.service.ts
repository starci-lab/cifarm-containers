import { Injectable, Logger, Inject } from "@nestjs/common"
import { TileEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetTilesArgs } from "./tiles.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getTiles({ limit = 10, offset = 0 }: GetTilesArgs): Promise<Array<TileEntity>> {
        this.logger.debug(`GetTiles: limit=${limit}, offset=${offset}`)

        let tiles: Array<TileEntity>
        // const cachedData = await this.cacheManager.get<Array<TileEntity>>(REDIS_KEY.TILES)

        // if (cachedData) {
        //     this.logger.debug("GetTiles: Returning data from cache")
        //     tiles = cachedData.slice(offset, offset + limit)
        // } else {
        //     this.logger.debug("GetTiles: From Database")
        //     tiles = await this.dataSource.manager.find(TileEntity)

        //     await this.cacheManager.set(REDIS_KEY.TILES, tiles)

        //     tiles = tiles.slice(offset, offset + limit)
        // }

        return tiles
    }
}
