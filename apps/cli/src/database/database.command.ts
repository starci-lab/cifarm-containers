import { Command, CommandRunner } from "nest-commander"
import { SeedCommand } from "./seed"
import { Logger } from "@nestjs/common"
import { BackupCommand } from "./backup"
import { SanitizeUsernamesCommand } from "./sanitize-usernames"
import { RestoreCommand } from "./restore"

@Command({
    name: "database",
    aliases: ["db"],
    description: "manage database actions",
    subCommands: [ SeedCommand, BackupCommand, SanitizeUsernamesCommand, RestoreCommand ]
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