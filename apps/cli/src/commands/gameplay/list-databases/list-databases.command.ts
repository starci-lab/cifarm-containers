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

    async process(fn: (...args: Array<unknown>) => unknown): Promise<void> {
        try {
            await fn()
        } finally {
            await this.dataSource.destroy()
        }
    }

    async run(_: Array<string>, options?: ListDatabaseCommandOptions): Promise<void> {
        // test the connection
        const fn = async () => {
            // case when the options are not provided
            const databases = await this.dataSource.manager.find(GameplayDatabaseEntity, {
                select: {
                    id: true,
                    host: true,
                    port: true,
                    username: true,
                    dbName: true,
                    password: options.showPassword ? true : false,
                }
            })
            console.table(databases)
        }
        await this.process(fn)
    }

    @Option({
        flags: "-s, --show-password",
        description: "show the password"
    })
    parseShowPassword(): boolean {
        return true
    }
}


export interface ListDatabaseCommandOptions {
    showPassword?: boolean
}