import { SignedMessage } from "../common"
import {
    mnemonicFromSeed,
    mnemonicToSecretKey,
    signBytes,
    verifyBytes
} from "algosdk"
import { Injectable, Logger } from "@nestjs/common"
import { mnemonicToSeedSync } from "bip39"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class AlgorandAuthService implements IBlockchainAuthService {
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

    public signMessage({ message, privateKey }: SignMessageParams) {
        return Buffer.from(signBytes(Buffer.from(message, "base64"), Buffer.from(privateKey, "base64"))).toString("base64")
    }

    public getKeyPair(accountNumber: number) {
        const seed = mnemonicToSeedSync(
            fakeConfig.mnemonic,
            accountNumber.toString(),
        )
        const algorandMnemonic = mnemonicFromSeed(seed.subarray(0, 32))
        const { addr, sk } = mnemonicToSecretKey(algorandMnemonic)
        return {
            publicKey: addr.toString(),
            privateKey: Buffer.from(sk).toString("base64"),
            accountAddress: addr.toString()
        }
    }
}