import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { envConfig } from "@src/config"
import { CliSqliteService, GameplayPostgreSQLEntity, GameplayPostgreSQLType } from "@src/databases"
import { isProduction } from "@src/utils"
import { DataSource } from "typeorm"

@Injectable()
export class GameplayPostgreSQLInitService implements OnModuleInit {
    private readonly logger = new Logger(GameplayPostgreSQLInitService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly cliSqliteService: CliSqliteService
    ) {
        this.dataSource = this.cliSqliteService.getDataSource()
    }

    async onModuleInit() {
        const mainDataSource = this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
            where: {
                type: GameplayPostgreSQLType.Main
            }
        })
        if (!mainDataSource) {
            await this.dataSource.manager.save(GameplayPostgreSQLEntity, {
                host: envConfig().database.postgresql.gameplay.main.host,
                port: envConfig().database.postgresql.gameplay.main.port,
                username: envConfig().database.postgresql.gameplay.main.username,
                password: envConfig().database.postgresql.gameplay.main.password,
                dbName: envConfig().database.postgresql.gameplay.main.dbName,
                selected: true,
                type: GameplayPostgreSQLType.Main
            })
        }

        // check if production

        if (!isProduction()) {
            const testDataSource = this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
                where: {
                    type: GameplayPostgreSQLType.Test
                }
            })
            if (!testDataSource) {
                await this.dataSource.manager.save(GameplayPostgreSQLEntity, {
                    host: envConfig().database.postgresql.gameplay.test.host,
                    port: envConfig().database.postgresql.gameplay.test.port,
                    username: envConfig().database.postgresql.gameplay.test.username,
                    password: envConfig().database.postgresql.gameplay.test.password,
                    dbName: envConfig().database.postgresql.gameplay.test.dbName,
                    selected: false,
                    type: GameplayPostgreSQLType.Test
                })
            }
        }

        this.logger.log("Initialized gameplay PostgreSQL database")
    }
}