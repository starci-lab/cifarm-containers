import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { CipherService } from "@src/crypto"

@SubCommand({ name: "encrypt-to-base64", description: "Encrypt a text to base64" })
export class EncryptToBase64Command extends CommandRunner {
    private readonly logger = new Logger(EncryptToBase64Command.name)

    constructor(
        private readonly cipherService: CipherService
    ) {
        super()
    }

    async run(_: Array<string>, options?: EncryptToBase64CommandOptions): Promise<void> {
        this.logger.debug("Encrypting the text to base64...")
        const { text } = options
        try {
            const encryptedText = this.cipherService.encrypt(text)
            this.logger.debug(`Encrypted text: ${encryptedText}`)
        } catch (error) {
            this.logger.error(`Failed to encrypt the text: ${error.message}`)
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

export interface EncryptToBase64CommandOptions {
    text: string
}
