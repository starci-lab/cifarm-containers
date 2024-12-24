import { Command, CommandRunner } from "nest-commander"
import { AddDataSourceCommand } from "./add-data-source"
import { ListDataSourcesCommand } from "./list-data-sources"
import { SelectDataSourceCommand } from "./select-data-source"
import { SeedCommand } from "./seed"

@Command({
    name: "gameplay",
    aliases: ["g"],
    description: "manage the gameplay related actions",
    subCommands: [ AddDataSourceCommand, ListDataSourcesCommand, SelectDataSourceCommand, SeedCommand ]
})
export class GameplayCommand extends CommandRunner {
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.command.outputHelp()
    }
}