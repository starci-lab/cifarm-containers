import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import { sign } from "tweetnacl"
import { mnemonicToSeedSync } from "bip39"
import { fakeConfig } from "@src/config"
import { Keypair } from "@solana/web3.js"
import { decode } from "bs58"

@Injectable()
export class SolanaAuthService {
    private readonly logger = new Logger(SolanaAuthService.name)
    constructor() {}
 
    public verifyMessage({
        message,
        signature,
        publicKey,
    }: Omit<SignedMessage, "chainName">) {
        try {
            const result = sign.detached.verify(
                Buffer.from(message, "base64"),
                Buffer.from(signature, "base64"),
                decode(publicKey),
            )
            this.logger.log(`Message verification result: ${result}`)
            return result
        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    public signMessage(message: string, privateKey: string) {
        return Buffer.from(
            sign.detached(
                Buffer.from(message, "base64"),
                decode(privateKey),
            ),
        ).toString("base64")
    }

    public getFakeKeyPair(accountNumber: number) {
        const seed = mnemonicToSeedSync(
            fakeConfig().mnemonic,
            accountNumber.toString(),
        )
        return Keypair.fromSeed(seed.subarray(0, 32))
    }
}
