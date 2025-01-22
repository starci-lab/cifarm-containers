import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import {
    encodeAddress,
    mnemonicToMiniSecret,
    sr25519PairFromSeed,
    sr25519Sign,
    sr25519Verify,
} from "@polkadot/util-crypto"
import { hexToU8a, u8aToHex } from "@polkadot/util"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class PolkadotAuthService implements IBlockchainAuthService {
    private readonly logger = new Logger(PolkadotAuthService.name)
    constructor() {}

    public verifyMessage({
        message,
        signature,
        publicKey,
    }: Omit<SignedMessage, "chainName">) {
        try {
            return sr25519Verify(
                Buffer.from(message, "base64"),
                Buffer.from(signature, "base64"),
                hexToU8a(publicKey),
            )
        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    public signMessage({ message, privateKey, publicKey }: SignMessageParams) {
        return Buffer.from(
            sr25519Sign(Buffer.from(message, "base64"), {
                secretKey: hexToU8a(privateKey),
                publicKey: hexToU8a(publicKey),
            }),
        ).toString("base64")
    }

    public getKeyPair(accountNumber: number) {
        const seed = mnemonicToMiniSecret(
            fakeConfig.mnemonic,
            accountNumber.toString(),
        )
        const { publicKey, secretKey } = sr25519PairFromSeed(seed)
        return {
            accountAddress: encodeAddress(publicKey),
            privateKey: u8aToHex(secretKey),
            publicKey: u8aToHex(publicKey),
        }
    }
}
