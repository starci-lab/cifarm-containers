import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { EncryptToBase64Command } from "./encrypt-to-base64"
import { DecryptFromBase64Command } from "./decrypt-from-base64"

@Command({
    name: "encrypt",
    aliases: ["enc"],
    description: "manage encrypt actions",
    subCommands: [
        EncryptToBase64Command,
        DecryptFromBase64Command
    ]
})
export class EncryptCommand extends CommandRunner {
    private readonly logger = new Logger(EncryptCommand.name)
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. seed")
    }
}
