import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { PublishCastCommand } from "./publish-cast"

@Command({
    name: "farcaster",
    aliases: ["fc"],
    description: "manage farcaster actions",
    subCommands: [
        PublishCastCommand
    ]
})
export class FarcasterCommand extends CommandRunner {
    private readonly logger = new Logger(FarcasterCommand.name)
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. seed")
    }
}
