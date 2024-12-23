import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { SqliteModule } from "./sqlite"

@Module({
    imports: [
        SqliteModule,
        CommandsModule
    ]
})
export class AppModule {}