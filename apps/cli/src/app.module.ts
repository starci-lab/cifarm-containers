import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { SqliteModule } from "./sqlite"
import { LoggerModule } from "./logger"

@Module({
    imports: [
        LoggerModule,
        SqliteModule,
        CommandsModule
    ]
})
export class AppModule {}