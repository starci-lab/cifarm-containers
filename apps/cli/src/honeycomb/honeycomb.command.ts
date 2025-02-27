import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { CreateProjectCommand } from "./create-project"
import { CreateResourceCommand } from "./create-resource"
import { MintResourceCommand } from "./mint-resource"

@Command({
    name: "honeycomb",
    aliases: ["hc"],
    description: "manage honeycomb actions",
    subCommands: [ CreateProjectCommand, CreateResourceCommand, MintResourceCommand ]
})
export class HoneycombCommand extends CommandRunner {
    private readonly logger = new Logger(HoneycombCommand.name)
    constructor(
    ) {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. seed")
    }
}