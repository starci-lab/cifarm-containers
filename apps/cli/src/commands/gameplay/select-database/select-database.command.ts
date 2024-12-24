import { CommandRunner, SubCommand, Option } from "nest-commander"
import { DataSource } from "typeorm"
import { GameplayDatabaseEntity } from "../../../sqlite"
@SubCommand({
    name: "select-database",
    description: "select a database"
})
export class SelectDatabaseCommand extends CommandRunner {
    constructor(
        private readonly dataSource: DataSource,
    ) {
        super()
    }


    async run(_: string[], options?: SelectDatabaseCommandOptions): Promise<void> {
        // test the connection
        const { id, name } = options
        if (id) {
            const database = await this.dataSource.manager.findOne(GameplayDatabaseEntity, {
                where: { id }
            })
            if (!database) {
                console.error("Database not found")
                return
            }
            await this.dataSource.manager.update(GameplayDatabaseEntity, { selected: false }, { selected: true })
            await this.dataSource.manager.update(GameplayDatabaseEntity, { id }, { selected: true })
            console.log(`Database ${id} selected`)
            return
        }

        if (name) {
            const database = await this.dataSource.manager.findOne(GameplayDatabaseEntity, {
                where: { name }
            })
            if (!database) {
                console.error("Database not found")
                return
            }
            await this.dataSource.manager.update(GameplayDatabaseEntity, { selected: false }, { selected: true })
            await this.dataSource.manager.update(GameplayDatabaseEntity, { name }, { selected: true })
            console.log(`Database ${name} selected`)
            return
        }

        console.error("Please provide an id or a name") 
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


export interface SelectDatabaseCommandOptions {
    id?: string
    name?: string
}