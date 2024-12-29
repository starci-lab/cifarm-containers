import { Command, CommandRunner } from "nest-commander"
import { SeedCommand } from "./seed"
import { SwitchCommand } from "./switch"
import { Logger } from "@nestjs/common"

@Command({
    name: "database",
    aliases: ["db"],
    description: "manage database actions",
    subCommands: [ SeedCommand, SwitchCommand ]
})
export class DatabaseCommand extends CommandRunner {
    private readonly logger = new Logger(DatabaseCommand.name)
    constructor(
    ) {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("NOT_PROVIDE_SUBCOMMAND", "Please provide a subcommand", "For example: cifarm database seed")
    }
}