import { Command, CommandRunner } from "nest-commander"
import { SeedCommand } from "./seed"
import { LoggerService } from "../../logger"

@Command({
    name: "gameplay-postgresql",
    aliases: ["gp"],
    description: "manage the gameplay related actions",
    subCommands: [ SeedCommand ]
})
export class GameplayPostgresqlCommand extends CommandRunner {
    constructor(
        private readonly loggerService: LoggerService
    ) {
        super()
    }

    async run(): Promise<void> {
        this.loggerService.error("NOT_PROVIDE_SUBCOMMAND", "Please provide a subcommand", "For example: cifarm gameplay-postgresql seed")
    }
}