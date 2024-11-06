import { fakeConfig } from "@src/config"
import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import {
    verifyMessage as _verifyMessage,
    HDNodeWallet,
    Mnemonic,
    Wallet,
} from "ethers"

@Injectable()
export class EvmAuthService {
    private readonly logger = new Logger(EvmAuthService.name)
    constructor() {}

    public verifyMessage({
        message,
        signature,
        publicKey,
    }: Omit<SignedMessage, "chainName">) {
        try {
            return _verifyMessage(message, signature) === publicKey
        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    public signMessage(message: string, privateKey: string) {
        const account = new Wallet(privateKey)
        return account.signMessageSync(message)
    }

    public getFakeKeyPair(accountNumber: number) {
        return HDNodeWallet.fromMnemonic(
            Mnemonic.fromPhrase(fakeConfig().mnemonic),
            `m/44'/60'/${accountNumber}'/0/0`,
        )
    }
}
