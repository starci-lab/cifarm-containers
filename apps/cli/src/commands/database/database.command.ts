import { Command, CommandRunner } from "nest-commander"
import { SeedCommand } from "./seed"
import { SwitchCommand } from "./switch"
import { Logger } from "@nestjs/common"
import { InitCommand } from "./init"

@Command({
    name: "database",
    aliases: ["db"],
    description: "manage database actions",
    subCommands: [ SeedCommand, SwitchCommand, InitCommand ]
})
export class DatabaseCommand extends CommandRunner {
    private readonly logger = new Logger(DatabaseCommand.name)
    constructor(
    ) {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. seed")
    }
}