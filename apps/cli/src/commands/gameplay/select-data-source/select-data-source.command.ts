import { CommandRunner, SubCommand, Option } from "nest-commander"
import { DataSource } from "typeorm"
import { GameplayDataSourceEntity } from "../../../sqlite"
import { LoggerService } from "../../../logger"
@SubCommand({
    name: "select-data-source",
    description: "select a data source"
})
export class SelectDataSourceCommand extends CommandRunner {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly dataSource: DataSource,
    ) {
        super()
    }

    async run(_: string[], options?: SelectDataSourceCommandOptions): Promise<void> {
        // test the connection
        const { id, name } = options
        if (id) {
            const database = await this.dataSource.manager.findOne(GameplayDataSourceEntity, {
                where: { id }
            })
            if (!database) {
                this.loggerService.error("DATABASE_NOT_FOUND", `Database with id ${id} not found.`, "You can retry by providing a different id.")
                return
            }
            await this.dataSource.manager.update(GameplayDataSourceEntity, { selected: true }, { selected: false })
            await this.dataSource.manager.update(GameplayDataSourceEntity, { id }, { selected: true })
            this.loggerService.success("DATABASE_SELECTED", `Database with id ${id} selected.`)
            return
        }

        if (name) {
            const database = await this.dataSource.manager.findOne(GameplayDataSourceEntity, {
                where: { name }
            })
            if (!database) {
                console.error("Database not found")
                return
            }
            await this.dataSource.manager.update(GameplayDataSourceEntity, { selected: false }, { selected: true })
            await this.dataSource.manager.update(GameplayDataSourceEntity, { name }, { selected: true })
            this.loggerService.success("DATABASE_SELECTED", `Database with name ${name} selected.`)
            return
        }

        this.loggerService.error("DATABASE_NOT_PROVIDED", "Please provide a database id or name.")
    }

    // Define the options available for this subcommand
    @Option({
        flags: "-i, --id <id>",
        description: "Select the database by id",
    })
    parseId(val: string): string {
        return val
    }

    @Option({
        flags: "-n, --name <name>",
        description: "Select the database by name",
    })
    parseName(val: string): string {
        return val
    }
}


export interface SelectDataSourceCommandOptions {
    id?: string
    name?: string
}