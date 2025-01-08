import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, ToolEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GetToolsArgs } from "./tools.dto"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }

    async getTool(id: string): Promise<ToolEntity | null> {
        this.logger.debug(`GetToolById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tool = await queryRunner.manager.findOne(ToolEntity, {
                where: { id },
            })
            return tool
        } finally {
            await queryRunner.release()
        }
    }

    async getTools({ limit = 10, offset = 0 }: GetToolsArgs): Promise<Array<ToolEntity>> {
        this.logger.debug(`GetTools: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tools = await queryRunner.manager.find(ToolEntity, {
                take: limit,
                skip: offset,
            })
            return tools
        } finally {
            await queryRunner.release()
        }
    }
}
