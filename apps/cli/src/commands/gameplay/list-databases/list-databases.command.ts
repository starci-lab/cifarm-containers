import { GameplayDatabaseEntity } from "../../../sqlite"
import { CommandRunner, Option, SubCommand } from "nest-commander"
import { DataSource } from "typeorm"

@SubCommand({
    name: "list-databases",
    description: "list all databases"
})
export class ListDatabasesCommand extends CommandRunner {
    constructor(
        private readonly dataSource: DataSource
    ) {
        super()
    }

    async run(_: Array<string>, options?: ListDatabaseCommandOptions): Promise<void> {
        // list all databases
        const databases = await this.dataSource.manager.find(GameplayDatabaseEntity, {
            select: {
                id: true,
                host: true,
                port: true,
                username: true,
                dbName: true,
                password: options.showPassword ? true : false,
                selected: true
            }
        })
        console.table(databases)
    }

    @Option({
        flags: "-s, --show-password",
        description: "show the password",
    })
    parseShowPassword(): boolean {
        return true
    }
}


export interface ListDatabaseCommandOptions {
    showPassword?: boolean
}