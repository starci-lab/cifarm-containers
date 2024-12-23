import { Command, CommandRunner } from "nest-commander"
import { AddDatabaseCommand } from "./add-database"
import { ListDatabasesCommand } from "./list-databases"

@Command({
    name: "gameplay",
    aliases: ["g"],
    description: "manage the gameplay related actions",
    subCommands: [ AddDatabaseCommand, ListDatabasesCommand ]
})
export class GameplayCommand extends CommandRunner {
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.command.outputHelp()
    }
}