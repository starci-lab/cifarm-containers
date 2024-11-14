import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ToolEntity } from "@src/database"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"

@Module({
    imports: [TypeOrmModule.forFeature([ToolEntity])],
    providers: [ToolsService, ToolsResolver]
})
export class ToolsModule {}
