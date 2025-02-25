import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import { sign } from "tweetnacl"
import { mnemonicToSeedSync } from "bip39"
import { Keypair } from "@solana/web3.js"
import { decode, encode } from "bs58"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class SolanaAuthService implements IBlockchainAuthService {
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

    public signMessage({ message, privateKey }: SignMessageParams) {
        return Buffer.from(
            sign.detached(
                Buffer.from(message, "base64"),
                decode(privateKey),
            ),
        ).toString("base64")
    }

    public getKeyPair(accountNumber: number) {
        const seed = mnemonicToSeedSync(
            fakeConfig.mnemonic,
            accountNumber.toString(),
        )
        const { publicKey, secretKey } = Keypair.fromSeed(seed.subarray(0, 32))
        return {
            publicKey: publicKey.toBase58(),
            privateKey: encode(secretKey),
            accountAddress: publicKey.toBase58(),
        }
    }
}
