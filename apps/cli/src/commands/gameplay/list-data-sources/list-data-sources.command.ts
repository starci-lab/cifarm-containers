import { GameplayDataSourceEntity } from "../../../sqlite"
import { LoggerService } from "../../../logger"
import { CommandRunner, Option, SubCommand } from "nest-commander"
import { DataSource } from "typeorm"

@SubCommand({
    name: "list-data-sources",
    description: "list all data sources"
})
export class ListDataSourcesCommand extends CommandRunner {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly dataSource: DataSource
    ) {
        super()
    }

    async run(_: Array<string>, options?: ListDataSourcesCommandOptions): Promise<void> {
        // list all databases
        const dataSources = await this.dataSource.manager.find(GameplayDataSourceEntity, {
            select: {
                id: true,
                host: true,
                port: true,
                username: true,
                dbName: true,
                password: options.showPassword ? true : false,
                selected: true,
                name: true
            }
        })
        if (!dataSources.length) {
            this.loggerService.error("NO_DATA_SOURCES", "No data sources found.", "Try to add a new data source first.")
            return
        }
        this.loggerService.table(dataSources)
    }

    @Option({
        flags: "-s, --show-password",
        description: "show the password",
    })
    parseShowPassword(): boolean {
        return true
    }
}


export interface ListDataSourcesCommandOptions {
    showPassword?: boolean
}