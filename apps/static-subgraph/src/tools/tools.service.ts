import { Injectable, Logger } from "@nestjs/common"
import { ToolEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetToolsArgs } from "./tools.dto"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getTools({
        limit = 10,
        offset = 0,
    }: GetToolsArgs): Promise<Array<ToolEntity>> {
        this.logger.debug(`GetTools: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(ToolEntity, {
            take: limit,
            skip: offset,
        })
    }
}
