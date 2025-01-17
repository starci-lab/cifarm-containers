import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { BuildThenPushCommand } from "./build-then-push"

@Command({
    name: "docker",
    description: "manage docker actions",
    subCommands: [ BuildThenPushCommand ]
})
export class DockerCommand extends CommandRunner {
    private readonly logger = new Logger(DockerCommand.name)
    constructor(
    ) {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. build-then-push")
    }
}