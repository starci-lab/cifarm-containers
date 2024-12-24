import { Command, CommandRunner } from "nest-commander"
import { AddDatabaseCommand } from "./add-database"
import { ListDatabasesCommand } from "./list-databases"
import { SelectDatabaseCommand } from "./select-database"

@Command({
    name: "gameplay",
    aliases: ["g"],
    description: "manage the gameplay related actions",
    subCommands: [ AddDatabaseCommand, ListDatabasesCommand, SelectDatabaseCommand ]
})
export class GameplayCommand extends CommandRunner {
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.command.outputHelp()
    }
}