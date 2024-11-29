import { Module } from "@nestjs/common"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"

@Module({
    providers: [ToolsService, ToolsResolver]
})
export class ToolsModule {}
