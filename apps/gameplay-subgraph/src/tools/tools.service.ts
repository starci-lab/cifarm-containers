import { Injectable, Logger, Inject, UseInterceptors } from "@nestjs/common"
import { ToolEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetToolsArgs } from "./"
import { CACHE_MANAGER, CacheInterceptor, CacheKey } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    private readonly relations = {
        // Add relations here if needed
    }

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey("tools")
    async getTools({ limit = 10, offset = 0 }: GetToolsArgs): Promise<Array<ToolEntity>> {
        this.logger.debug(`GetTools: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tools = await queryRunner.manager.find(ToolEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return tools
        } finally {
            await queryRunner.release()
        }
    }

    async getToolById(id: string): Promise<ToolEntity | null> {
        this.logger.debug(`GetToolById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tool = await queryRunner.manager.findOne(ToolEntity, {
                where: { id },
                relations: this.relations
            })
            return tool
        } finally {
            await queryRunner.release()
        }
    }
}
