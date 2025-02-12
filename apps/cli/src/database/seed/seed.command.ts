import { CommandRunner, SubCommand, Option } from "nest-commander"
import { SeedersService } from "./seeders"
import { DataSource } from "typeorm"
import { Logger } from "@nestjs/common"

@SubCommand({ name: "seed", description: "Seed static data into the data source" })
export class SeedCommand extends CommandRunner {
    private readonly logger = new Logger(SeedCommand.name)

    constructor(
        private readonly seedersService: SeedersService
    ) {
        super()
    }

    async run(_: Array<string>, options?: SeedCommandOptions): Promise<void> {
        let dataSource: DataSource
        try {
            if (options?.database) {
                // temporatory left blank
            }

            if (options?.create) {
                // temporatory left blank
            }

            if (options?.force) {
                // temporatory left blank
                process.argv.push("--refresh")
            }

            //run seeders
            await this.seedersService.runSeeders()

            this.logger.log("Seeders ran successfully")
        } catch (error) {
            this.logger.error(`Seed command failed: ${error.message}`)
        } finally {
            //destroy the data source
            if (dataSource) {
                await dataSource.destroy()
            }
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
