import { CommandRunner, SubCommand } from "nest-commander"
import { Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CliSqliteService, GameplayPostgreSQLEntity, TelegramUserTrackerPostgreSQLEntity } from "@src/databases"
import { GameplayPostgreSQLType } from "@src/databases"
import { envConfig, isProduction } from "@src/env"

@SubCommand({ name: "init", description: "Initialize database" })
export class InitCommand extends CommandRunner {
    private readonly logger = new Logger(InitCommand.name)
    private readonly dataSource: DataSource
    
    constructor(
        private readonly cliSqliteService: CliSqliteService
    ) {
        super()
        this.dataSource = this.cliSqliteService.getDataSource()
    }

    async run(): Promise<void> {
        await this.initDataSources()
    }

    async initDataSources() {
        this.logger.debug("Initializing data sources")

        const dataSource = await this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
            where: { type: GameplayPostgreSQLType.Main }
        })
        if (dataSource) {
            this.logger.verbose("Main data source already initialized, try updating instead")
        }
        await this.dataSource.manager.save(GameplayPostgreSQLEntity, {
            id: dataSource?.id,
            host: envConfig().database.postgresql.gameplay.main.host,
            port: envConfig().database.postgresql.gameplay.main.port,
            username: envConfig().database.postgresql.gameplay.main.username,
            password: envConfig().database.postgresql.gameplay.main.password,
            dbName: envConfig().database.postgresql.gameplay.main.dbName,
            selected: true,
            type: GameplayPostgreSQLType.Main
        })
    
        // check if production
        if (!isProduction()) {
            const dataSource = await this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
                where: { type: GameplayPostgreSQLType.Test }
            })
            if (dataSource) {
                this.logger.verbose("Test data source already initialized, try updating instead")
            }
            await this.dataSource.manager.save(GameplayPostgreSQLEntity, {
                id: dataSource?.id,
                host: envConfig().database.postgresql.gameplay.test.host,
                port: envConfig().database.postgresql.gameplay.test.port,
                username: envConfig().database.postgresql.gameplay.test.username,
                password: envConfig().database.postgresql.gameplay.test.password,
                dbName: envConfig().database.postgresql.gameplay.test.dbName,
                selected: false,
                type: GameplayPostgreSQLType.Test
            })
        }

        // Telegram user tracker PostgreSQL
        await this.dataSource.manager.save(TelegramUserTrackerPostgreSQLEntity, {
            host: envConfig().database.postgresql.telegramUserTracker.main.host,
            port: envConfig().database.postgresql.telegramUserTracker.main.port,
            username: envConfig().database.postgresql.telegramUserTracker.main.username,
            password: envConfig().database.postgresql.telegramUserTracker.main.password,
            dbName: envConfig().database.postgresql.telegramUserTracker.main.dbName,
            selected: true
        })

        this.logger.log("Initialized gameplay PostgreSQL database")
    }
}