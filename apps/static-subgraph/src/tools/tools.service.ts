import { Injectable, Logger, Inject } from "@nestjs/common"
import { ToolEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetToolsArgs } from "./tools.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { REDIS_KEY } from "@src/constants"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getTools({ limit = 10, offset = 0 }: GetToolsArgs): Promise<Array<ToolEntity>> {
        this.logger.debug(`GetTools: limit=${limit}, offset=${offset}`)

        const cachedData = await this.cacheManager.get<Array<ToolEntity>>(REDIS_KEY.TOOLS)
        let tools: Array<ToolEntity>

        if (cachedData) {
            this.logger.debug("GetTools: Returning data from cache")
            tools = cachedData.slice(offset, offset + limit)
        } else {
            this.logger.debug("GetTools: From Database")
            tools = await this.dataSource.manager.find(ToolEntity)

            await this.cacheManager.set(REDIS_KEY.TOOLS, tools)

            tools = tools.slice(offset, offset + limit)
        }

        return tools
    }
}
