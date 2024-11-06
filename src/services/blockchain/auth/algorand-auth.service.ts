import { fakeConfig } from "@src/config"
import { SignedMessage } from "../common"
import {
    mnemonicFromSeed,
    mnemonicToSecretKey,
    signBytes,
    verifyBytes
} from "algosdk"
import { Injectable, Logger } from "@nestjs/common"
import { mnemonicToSeedSync } from "bip39"

@Injectable()
export class AlgorandAuthService {
    private readonly logger = new Logger(AlgorandAuthService.name)
    constructor() {}

    public verifyMessage({ message, signature, publicKey }: Omit<SignedMessage, "chainName">) {
        try {
            return verifyBytes(Buffer.from(message, "base64"), Buffer.from(signature, "base64"), publicKey)
        } catch (ex) {
            this.logger.error(ex)
            return false
        } 
    }

    public signMessage(message: string, privateKey: string) {
        return Buffer.from(signBytes(Buffer.from(message, "base64"), Buffer.from(privateKey, "base64"))).toString("base64")
    }

    public getFakeKeyPair(accountNumber: number) {
        const seed = mnemonicToSeedSync(
            fakeConfig().mnemonic,
            accountNumber.toString(),
        )
        const algorandMnemonic = mnemonicFromSeed(seed.subarray(0, 32))
        return mnemonicToSecretKey(algorandMnemonic)
    }
}