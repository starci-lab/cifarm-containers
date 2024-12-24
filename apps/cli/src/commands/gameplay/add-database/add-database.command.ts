import { GameplayDatabaseEntity } from "../../../sqlite"
import { CommandRunner, SubCommand, Option } from "nest-commander"
import { DataSource } from "typeorm"
import { v4 } from "uuid"

@SubCommand({
    name: "add-database",
    description: "add a new database"
})
export class AddDatabaseCommand extends CommandRunner {
    constructor(
        private readonly dataSource: DataSource,
    ) {
        super()
    }

    async run(_: string[], options?: AddDatabaseCommandOptions): Promise<void> {
        // get the options
        const { password, create, database, host, port, username, name } = options

        // check if the database already exists
        const exists = await this.dataSource.manager.findOne(GameplayDatabaseEntity, {
            where: { name }
        })
        if (exists) {
            console.error("Database already exists")
            return
        }
        // check if the database exists
        if (create) {
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

        // update the selected database
        await this.dataSource.manager.update(GameplayDatabaseEntity, { selected: false }, {})
        // create the database
        const { id } = await this.dataSource.manager.save(GameplayDatabaseEntity, {
            host,
            port,
            username,
            password: options.password,
            dbName: database,
        })
        console.log(`Database created with id: ${id}`)
    }

    // Define the options available for this subcommand
    @Option({
        flags: "-h, --host <host>",
        description: "Specify the host of the database (default: localhost)",
        defaultValue: "localhost",
    })
    parseHost(val: string): string {
        return val
    }

    @Option({
        flags: "-n, --name <name>",
        description: "Specify the name of the database (randomly generated if not provided)",
        defaultValue: "",
    })
    parseName(val: string): string {
        if (!val) {
            return v4()
        }
    }

    @Option({
        flags: "-p, --port <port>",
        description: "Specify the port of the database (default: 5432)",
        defaultValue: 5432,
    })
    parsePort(val: string): number {
        return parseInt(val)
    }

    @Option({
        flags: "-u, --username <username>",
        description: "Specify the username for the database (default: postgres)",
        defaultValue: "postgres",
    })
    parseUsername(val: string): string {
        return val
    }

    @Option({
        flags: "-P, --password <password>",
        description: "Specify the password for the database",
    })
    parsePassword(val: string): string {
        return val
    }

    @Option({
        flags: "-d, --database <database>",
        description: "Specify the name of the database (default: gameplay)",
        defaultValue: "gameplay",
    })
    parseDatabase(val: string): string {
        return val
    }

    @Option({
        flags: "-c, --create",
        description: "Create the database if it does not exist",
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
    name?: string
}