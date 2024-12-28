import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { GameplayPostgreSQLEntity, GameplayPostgreSQLName, SqliteService } from "../../sqlite"
import { envConfig } from "@src/config"
import { isProduction } from "@src/utils"

@Injectable()
export class GameplayPostgreSQLService implements OnModuleInit {
    private readonly logger = new Logger(GameplayPostgreSQLService.name)
    
    constructor(private readonly sqliteService: SqliteService) {}

    async onModuleInit() {
        const dataSource = this.sqliteService.getDataSource()
        
        await dataSource.manager.save(GameplayPostgreSQLEntity, {
            host: envConfig().database.postgresql.gameplay.main.host,
            port: envConfig().database.postgresql.gameplay.main.port,
            username: envConfig().database.postgresql.gameplay.main.username,
            password: envConfig().database.postgresql.gameplay.main.password,
            dbName: envConfig().database.postgresql.gameplay.main.dbName,
            selected: true,
            name: GameplayPostgreSQLName.Main
        })

        // check if production
        if (!isProduction()) {
            await dataSource.manager.save(GameplayPostgreSQLEntity, {
                host: envConfig().database.postgresql.gameplay.test.host,
                port: envConfig().database.postgresql.gameplay.test.port,
                username: envConfig().database.postgresql.gameplay.test.username,
                password: envConfig().database.postgresql.gameplay.test.password,
                dbName: envConfig().database.postgresql.gameplay.test.dbName,
                selected: false,
                name: GameplayPostgreSQLName.Test
            })
        }

        this.logger.log("Initialized gameplay PostgreSQL database")
    }
}