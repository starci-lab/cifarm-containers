import { LoggerService } from "../../../logger"
import { GameplayDataSourceEntity } from "../../../sqlite"
import { CommandRunner, SubCommand, Option } from "nest-commander"
import { DataSource } from "typeorm"
import { v4 } from "uuid"

@SubCommand({
    name: "add-data-source",
    description: "Add a new data source"
})
export class AddDataSourceCommand extends CommandRunner {
    constructor(
        private readonly loggerService: LoggerService,
        private readonly dataSource: DataSource,
    ) {
        super()
    }

    async run(_: string[], options?: AddDataSourceCommandOptions): Promise<void> {
        const { password, create, database, host, port, username } = options
        let name = options.name
        if (!name) {
            name = v4()  // Generate a random name if not provided
        }

        // Check if the DataSource already exists
        const exists = await this.dataSource.manager.findOne(GameplayDataSourceEntity, {
            where: { name }
        })

        if (exists) {
            this.loggerService.error("DATA_SOURCE_EXISTED", `Data source with name ${name} already exists.`, "You can retry by providing a different name.")
            return
        }

        // Check if we need to create the data source
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
                    this.loggerService.error("DATA_SOURCE_CREATION_FAILED", "Failed to create the data source.", `Error details: ${error.message}`)
                    return
                } finally {
                    await queryRunner.release()
                }
            } catch (error) {
                this.loggerService.error("DATA_SOURCE_CONNECTION_FAILED", "Failed to connect to the data source.", `Error details: ${error.message}`)
                return
            } finally {
                await createConn.destroy()
            }
        }

        // Test the connection
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
            await connection.destroy()
        } catch (error) {
            this.loggerService.error("DATA_SOURCE_CONNECTION_FAILED", "Failed to connect to the data source.", `Error details: ${error.message}`)
            return
        }

        try {
            // Update the selected data source
            await this.dataSource.manager.update(GameplayDataSourceEntity, { selected: true }, { selected: false })
            
            // Create the new data source entry
            await this.dataSource.manager.save(GameplayDataSourceEntity, {
                host,
                port,
                username,
                password,
                dbName: database,
                name,
            })
            this.loggerService.success("DATA_SOURCE_CREATED", `DataSource with name ${name} has been created successfully.`)
        } catch (error) {
            this.loggerService.error("DATA_SOURCE_CREATE_FAILED", "Failed to create the data source.", `Error details: ${error.message}`)
        }
    }

    @Option({
        flags: "-h, --host <host>",
        description: "Specify the host of the DataSource (default: localhost)",
        defaultValue: "localhost",
    })
    parseHost(val: string): string {
        return val
    }

    @Option({
        flags: "-n, --name <name>",
        description: "Specify the name of the data source (randomly generated if not provided)",
        defaultValue: "",
    })
    parseName(val: string): string {
        return val
    }

    @Option({
        flags: "-p, --port <port>",
        description: "Specify the port of the data source (default: 5432)",
        defaultValue: 5432,
    })
    parsePort(val: string): number {
        return parseInt(val)
    }

    @Option({
        flags: "-u, --username <username>",
        description: "Specify the username for the data source (default: postgres)",
        defaultValue: "postgres",
    })
    parseUsername(val: string): string {
        return val
    }

    @Option({
        flags: "-P, --password <password>",
        description: "Specify the password for the data source",
    })
    parsePassword(val: string): string {
        return val
    }

    @Option({
        flags: "-d, --database <database>",
        description: "Specify the database of the data source (default: gameplay)",
        defaultValue: "gameplay",
    })
    parseDatabase(val: string): string {
        return val
    }

    @Option({
        flags: "-c, --create",
        description: "Create the data source if it does not exist",
    })
    parseCreate(): boolean {
        return true
    }
}

export interface AddDataSourceCommandOptions {
    host?: string;
    port?: number;
    username?: string;
    password: string;
    database?: string;
    create?: boolean;
    name?: string;
}
