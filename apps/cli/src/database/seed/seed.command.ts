import { CommandRunner, SubCommand, Option } from "nest-commander"
import { SeedersService } from "./seeders"
import { DataSource } from "typeorm"
import { PostgreSQLOptionsFactory, CacheQueryService } from "@src/databases"
import { createDatabase } from "typeorm-extension"
import { Inject, Logger } from "@nestjs/common"
import {
    MAIN_GAMEPLAY_POSTGRESQL,
    MOCK_GAMEPLAY_POSTGRESQL,
    MAIN_TELEGRAM_POSTGRESQL,
    MOCK_TELEGRAM_POSTGRESQL
} from "./seed.constants"
import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

@SubCommand({ name: "seed", description: "Seed static data into the data source" })
export class SeedCommand extends CommandRunner {
    private readonly logger = new Logger(SeedCommand.name)
    private database: PostgreSQLDatabase
    private context: PostgreSQLContext

    constructor(
        @Inject(MAIN_GAMEPLAY_POSTGRESQL)
        private readonly mainGameplayPostgreSQLOptionsFactory: PostgreSQLOptionsFactory,
        @Inject(MOCK_GAMEPLAY_POSTGRESQL)
        private readonly mockGameplayPostgreSQLOptionsFactory: PostgreSQLOptionsFactory,
        @Inject(MAIN_TELEGRAM_POSTGRESQL)
        private readonly mainTelegramPostgreSQLOptionsFactory: PostgreSQLOptionsFactory,
        @Inject(MOCK_TELEGRAM_POSTGRESQL)
        private readonly mockTelegramPostgreSQLOptionsFactory: PostgreSQLOptionsFactory,
        private readonly cacheQueryService: CacheQueryService,
        private readonly seedersService: SeedersService
    ) {
        super()
    }

    async run(_: Array<string>, options?: SeedCommandOptions): Promise<void> {
        let dataSource: DataSource
        try {
            if (options?.database) {
                const values = Object.values(PostgreSQLDatabase)
                if (!values.includes(options.database as PostgreSQLDatabase)) {
                    this.logger.error(`Invalid database: ${options.database}`)
                    return
                }
                this.database = options.database as PostgreSQLDatabase
            } else {
                this.database = PostgreSQLDatabase.Gameplay
            }

            if (options?.mock) {
                this.context = PostgreSQLContext.Mock
            } else {
                this.context = PostgreSQLContext.Main
            }

            const factoryMap: Record<
                PostgreSQLDatabase,
                Record<PostgreSQLContext, PostgreSQLOptionsFactory>
            > = {
                [PostgreSQLDatabase.Gameplay]: {
                    [PostgreSQLContext.Main]: this.mainGameplayPostgreSQLOptionsFactory,
                    [PostgreSQLContext.Mock]: this.mockGameplayPostgreSQLOptionsFactory
                },
                [PostgreSQLDatabase.Telegram]: {
                    [PostgreSQLContext.Main]: this.mainTelegramPostgreSQLOptionsFactory,
                    [PostgreSQLContext.Mock]: this.mockTelegramPostgreSQLOptionsFactory
                }
            }
            const factory = factoryMap[this.database][this.context]

            const dataSourceOptions = factory.createDataSourceOptions()
            const synchronize = dataSourceOptions.synchronize

            if (options?.create) {
                await createDatabase({
                    options: dataSourceOptions
                })
            }

            dataSource = new DataSource({
                ...dataSourceOptions,
                //synchornize the database is turned off when call the createDatabase function, so we need to turn it back here
                synchronize
            })

            await dataSource.initialize()

            if (options?.force) {
                //remove all cache keys
                await this.cacheQueryService.clear()
                this.logger.debug("Cache keys removed successfully.")

                //clear seeders
                this.logger.debug("Forcing to recreate the seed data...")
                await this.seedersService.clearSeeders(dataSource)
                this.logger.verbose("Seed data cleared successfully.")
            }

            //run seeders
            await this.seedersService.runSeeders({
                dataSource,
                seedTracking: true
            })

            this.logger.log("Seeders ran successfully")
        } catch (error) {
            this.logger.error(`Seed command failed: ${error.message}`)
        } finally {
            //destroy the data source
            if (dataSource) {
                await dataSource.destroy()
            }
            //quit the redis client
            await this.cacheQueryService.getNativeRedis().quit()
        }
    }

    @Option({
        flags: "-c, --create",
        description: "Create the database if it does not exist"
    })
    parseCreate(): boolean {
        return true
    }

    @Option({
        flags: "-m, --mock",
        description: "Use mock db instead of real db"
    })
    parseMock(): boolean {
        return true
    }

    @Option({
        flags: "-f, --force",
        description: "Force to recreate the seed data"
    })
    parseForce(): boolean {
        return true
    }

    @Option({
        flags: "-d, --database <database>",
        description: "Database to seed"
    })
    parseDatabase(database: string): string {
        return database
    }
}

export interface SeedCommandOptions {
    //create the database if it does not exist
    create?: boolean
    //use mock db instead of real db
    mock?: boolean
    //database to seed
    database?: string
    //force to recreate the seed data
    force?: boolean
}
