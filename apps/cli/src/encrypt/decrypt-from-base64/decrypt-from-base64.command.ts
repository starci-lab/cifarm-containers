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

    async run(_: Array<string>, options?: DecryptToBase64CommandOptions): Promise<void> {
        this.logger.debug("Decrypting the text from base64...")
        const { text, password } = options
        const iv = this.cipherService.generateIv(password)
        try {
            const decryptedText = this.cipherService.decrypt(text, iv)
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

    @Option({
        flags: "-p, --password <password>",
        description: "Password",
        required: false
    })
    parsePassword(password: string): string {
        return password
    }
}

export interface DecryptToBase64CommandOptions {
    text: string
    password: string
}
