import { Module } from "@nestjs/common"
import { GameplayPostgreSQLInitService } from "./gameplay-postgresql.service"
import { CliSqliteModule } from "@src/databases"

@Module({
    imports: [CliSqliteModule.forRoot()],
    providers: [GameplayPostgreSQLInitService],
})
export class GameplayPostgreSQLInitModule { }