import {
    CliSqliteService,
    GameplayPostgreSQLEntity,
    GameplayPostgreSQLType,
} from "@src/databases"
import { DataSource } from "typeorm"
import { CommandRunner, Option, SubCommand } from "nest-commander"
import { Logger } from "@nestjs/common"

@SubCommand({ name: "switch", description: "Switch to another data source" })
export class SwitchCommand extends CommandRunner {
    private logger = new Logger(SwitchCommand.name)
    
    private readonly dataSource: DataSource
    constructor(
        private readonly cliSqliteService: CliSqliteService
    ) {
        super()
        this.dataSource = this.cliSqliteService.getDataSource()
    }

    async run(_: Array<string>, options: SwitchOptions): Promise<void> {
        const { type } = options
        
        const dataSource = await this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
            where: { type }
        })
        if (!dataSource) {
            this.logger.error("NO_DATASOURCE_FOUND", "No data source found.", "Try again with a different type.")
            return
        }

        await this.dataSource.manager.update(GameplayPostgreSQLEntity, { selected: true }, { selected: false })
        await this.dataSource.manager.update(GameplayPostgreSQLEntity, { id: dataSource.id }, { selected: true })

        this.logger.log(`Switched to ${type} data source`)
    }

    @Option({
        flags: "-t, --type <value>",
        description: "Type of the data source to switch to",
        defaultValue: GameplayPostgreSQLType.Main,
    })
    parseType(value: string): string {
        return value
    }
}

export interface SwitchOptions {
    type?: GameplayPostgreSQLType
}
  

