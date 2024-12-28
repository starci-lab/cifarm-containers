import { Module } from "@nestjs/common"
import { SqliteModule } from "../../sqlite"
import { GameplayPostgreSQLService } from "./gameplay-postgresql.service"

@Module({
    imports: [SqliteModule],
    providers: [GameplayPostgreSQLService],
})
export class GameplayPostgreSQLModule { }