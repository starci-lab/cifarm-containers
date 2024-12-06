import { Injectable, Logger, Inject, UseInterceptors } from "@nestjs/common"
import { ToolEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetToolsArgs } from "./tools.dto"
import { CACHE_MANAGER, CacheInterceptor, CacheKey } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey("tools")
    async getTools({ limit = 10, offset = 0 }: GetToolsArgs): Promise<Array<ToolEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            this.logger.debug(`GetTools: limit=${limit}, offset=${offset}`)
            const tools = await this.dataSource.getRepository(ToolEntity).find({
                take: limit,
                skip: offset
            })
            return tools
        } finally {
            await queryRunner.release()
        }
    }
}
