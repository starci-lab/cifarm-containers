import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import { nearKeyPair } from "../rpcs"
import { parseSeedPhrase } from "near-seed-phrase"
import { utils } from "near-api-js"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class NearAuthService implements IBlockchainAuthService {
    private readonly logger = new Logger(NearAuthService.name)
    constructor() {}

    public verifyMessage({ message, signature, publicKey }: Omit<SignedMessage, "chainName">) {
        try {
            const keyPair = utils.PublicKey.from(publicKey)
            const result = keyPair.verify(Buffer.from(message, "base64"), Buffer.from(signature, "base64"))
            return !!result
        } catch (ex) {
            this.logger.error(ex)
            return false
        } 
    }

    public signMessage({ message, privateKey }: SignMessageParams) {
        const keyPair = nearKeyPair(privateKey)
        return Buffer.from(keyPair.sign(Buffer.from(message, "base64")).signature).toString("base64")
    }

    public getKeyPair(accountNumber: number) {
        const { publicKey, secretKey } = parseSeedPhrase(
            fakeConfig.mnemonic,
            `m/44'/397'/0'/${accountNumber}'`
        )
        return {
            publicKey,
            privateKey: secretKey,
            accountAddress: publicKey,
        }
    }
}