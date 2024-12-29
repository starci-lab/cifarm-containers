import { Module } from "@nestjs/common"
import { InitCommand } from "./init.command"
import { CliSqliteModule } from "@src/databases"

@Module({
    imports: [ CliSqliteModule.forRoot() ],
    providers: [ InitCommand ],
})
export class InitModule {}