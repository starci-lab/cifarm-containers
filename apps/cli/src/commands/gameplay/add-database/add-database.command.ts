import { GameplayDatabaseEntity } from "../../../sqlite"
import { CommandRunner, SubCommand, Option, InquirerService } from "nest-commander"
import { DataSource } from "typeorm"
import { isEmpty } from "lodash"
import { ADD_DATABASE_QUESTIONS_NAME } from "./add-database.questions"

@SubCommand({
    name: "add-database",
    description: "add a new database"
})
export class AddDatabaseCommand extends CommandRunner {
    constructor(
        private readonly dataSource: DataSource,
        private readonly inquirer: InquirerService
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

    async run(_: string[], options?: AddDatabaseCommandOptions): Promise<void> {
        // test the connection
        const fn = async () => {

            // case when the options are not provided
            let anwsers: AddDatabaseCommandOptions
            if (isEmpty(options)) {
                anwsers = await this.inquirer.ask<AddDatabaseCommandOptions>(ADD_DATABASE_QUESTIONS_NAME, undefined)
            }

            const host = anwsers?.host || options?.host || "localhost"
            const port = anwsers?.port || options?.port || 5432
            const username = anwsers?.username || options?.username || "postgres"
            const database = anwsers?.database || options?.database || "gameplay"
            const password = anwsers?.password || options?.password

            // check if the database already exists
            const exists = await this.dataSource.manager.findOne(GameplayDatabaseEntity, {
                where: { host, port, username, dbName: database }
            })
            if (exists) {
                console.error("Database already exists")
                return
            }
            // check if the database exists
            if (options.create) {
                let createConn: DataSource
                try {
                    createConn = new DataSource({
                        type: "postgres",
                        host,
                        port,
                        username,
                        password,
                    })
                    await createConn.initialize()
                    const queryRunner = createConn.createQueryRunner()
                    await queryRunner.connect()
                    try {
                        await queryRunner.createDatabase(database, true)
                    } catch (error) {
                        console.error(`Failed to create the database: ${error.message}`)
                        return
                    } finally {
                        await queryRunner.release()
                        await createConn.destroy()
                    }
                } catch (error) {
                    console.error(`Failed to connect to the database: ${error.message}`)
                    return
                } finally {
                    await createConn.destroy()
                }
            }

            // test the connection
            let connection: DataSource
            try {
                connection = new DataSource({
                    type: "postgres",
                    host,
                    port,
                    username,
                    password,
                    database,
                })
                await connection.initialize()
            } catch (error) {
                console.error(`Failed to connect to the database: ${error.message}`)
                return
            } finally {
                await connection.destroy()
            }

            // create the database
            const { id } = await this.dataSource.manager.save(GameplayDatabaseEntity, {
                host,
                port,
                username,
                password: options.password,
                dbName: database
            })
            console.log(`Database created with id: ${id}`)
        }
        await this.process(fn)
    }

    // Define the options available for this subcommand
    @Option({
        flags: "-h, --host <host>",
        description: "Specify the host of the database (default: localhost)",
    })
    parseHost(val: string): string {
        return val
    }

    @Option({
        flags: "-p, --port <port>",
        description: "Specify the port of the database (default: 5432)",
    })
    parsePort(val: string): number {
        return parseInt(val)
    }

    @Option({
        flags: "-u, --username <username>",
        description: "Specify the username for the database (default: postgres)",
    })
    parseUsername(val: string): string {
        return val
    }

    @Option({
        flags: "-P, --password <password>",
        description: "Specify the password for the database (required)",
    })
    parsePassword(val: string): string {
        return val
    }

    @Option({
        flags: "-d, --database <database>",
        description: "Specify the name of the database (default: gameplay)",
    })
    parseDatabase(val: string): string {
        return val
    }

    @Option({
        flags: "-c, --create",
        description: "Create the database if it does not exist (default: false)",
    })
    parseCreate(): boolean {
        return true
    }
}


export interface AddDatabaseCommandOptions {
    host?: string
    port?: number
    username?: string
    password: string
    database?: string
    create?: boolean
}