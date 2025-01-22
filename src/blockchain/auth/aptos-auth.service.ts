import { SignedMessage } from "../common"
import {
    Account,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    Ed25519Signature,
} from "@aptos-labs/ts-sdk"
import { Injectable, Logger } from "@nestjs/common"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class AptosAuthService implements IBlockchainAuthService {
    private readonly logger = new Logger(AptosAuthService.name)
    constructor() {}

    public verifyMessage({ message, signature, publicKey }: Omit<SignedMessage, "chainName">) {
        try {
            const ed25519PublicKey = new Ed25519PublicKey(publicKey)
            const result = ed25519PublicKey.verifySignature({
                message,
                signature: new Ed25519Signature(signature),
            })
            return !!result
        } catch (ex) {
            this.logger.error(ex)
            return false
        } 
    }

    public signMessage({ message, privateKey }: SignMessageParams) {
        const ed25519PrivateKey = Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKey)
        })
        return ed25519PrivateKey.sign(message).toString()
    }

    public getKeyPair(accountNumber: number) {
        const { accountAddress, privateKey, publicKey } = Account.fromDerivationPath({
            mnemonic: fakeConfig.mnemonic,
            path: `m/44'/637'/${accountNumber}'/0'/0'`,
        })
        return {
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString(),
            accountAddress: accountAddress.toString()
        }
    }
}