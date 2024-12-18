import { Module } from "@nestjs/common"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [ToolsService, ToolsResolver]
})
export class ToolsModule {}
