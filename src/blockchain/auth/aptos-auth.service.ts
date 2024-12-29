import { SignedMessage } from "../common"
import {
    Account,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    Ed25519Signature,
} from "@aptos-labs/ts-sdk"
import { Injectable, Logger } from "@nestjs/common"
import { fakeConfig } from "../blockchain.config"

@Injectable()
export class AptosAuthService {
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

    public signMessage(message: string, privateKey: string) {
        const ed25519PrivateKey = Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKey)
        })
        return ed25519PrivateKey.sign(message).toString()
    }

    public toAddress(publicKey: string) {
        return new Ed25519PublicKey(publicKey).authKey().toString()
    }

    public getFakeKeyPair(accountNumber: number) {
        return Account.fromDerivationPath({
            mnemonic: fakeConfig.mnemonic,
            path: `m/44'/637'/${accountNumber}'/0'/0'`,
        })
    }
}