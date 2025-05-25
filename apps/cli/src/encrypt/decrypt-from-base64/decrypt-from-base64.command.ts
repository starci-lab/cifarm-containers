import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { CipherService } from "@src/crypto"

@SubCommand({ name: "decrypt-from-base64", description: "Decrypt a text from base64" })
export class DecryptFromBase64Command extends CommandRunner {
    private readonly logger = new Logger(DecryptFromBase64Command.name)

    constructor(
        private readonly cipherService: CipherService
    ) {
        super()
    }

    async run(_: Array<string>, options?: DecryptFromBase64CommandOptions): Promise<void> {
        this.logger.debug("Decrypting the text from base64...")
        const { text } = options
        try {
            const decryptedText = this.cipherService.decrypt(text)
            this.logger.debug(`Decrypted text: ${decryptedText}`)
        } catch (error) {
            this.logger.error(`Failed to decrypt the text: ${error.message}`)
        }
    }

    @Option({
        flags: "-t, --text <text>",
        description: "Text",
        required: true
    })
    parseText(text: string): string {
        return text
    }
}

export interface DecryptFromBase64CommandOptions {
    text: string
}
