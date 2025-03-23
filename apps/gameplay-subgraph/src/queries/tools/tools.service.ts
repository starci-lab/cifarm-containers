import { Injectable, Logger } from "@nestjs/common"
import { ToolId, ToolSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class ToolsService {
    private readonly logger = new Logger(ToolsService.name)

    constructor(private readonly staticService: StaticService) {}

    tool(id: ToolId): ToolSchema {
        return this.staticService.tools.find((tool) => tool.displayId === id)
    }

    tools(): Array<ToolSchema> {
        return this.staticService.tools
    }
}
