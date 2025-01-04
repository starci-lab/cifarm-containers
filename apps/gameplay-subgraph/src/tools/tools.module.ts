import { Module } from "@nestjs/common"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot() ],
    providers: [ ToolsService, ToolsResolver ]
})
export class ToolsModule {}
