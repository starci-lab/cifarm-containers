import { SignedMessage } from "../common"
import { Injectable, Logger } from "@nestjs/common"
import {
    verifyMessage as _verifyMessage,
    HDNodeWallet,
    Mnemonic,
    Wallet,
} from "ethers"
import { fakeConfig } from "../blockchain.config"
import { IBlockchainAuthService, SignMessageParams } from "./auth.types"

@Injectable()
export class EvmAuthService implements IBlockchainAuthService {
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

    public signMessage({ message, privateKey }: SignMessageParams) {
        const account = new Wallet(privateKey)
        return account.signMessageSync(message)
    }

    public getKeyPair(accountNumber: number) {
        const { address, privateKey, publicKey } = HDNodeWallet.fromMnemonic(
            Mnemonic.fromPhrase(fakeConfig.mnemonic),
            `m/44'/60'/${accountNumber}'/0/0`,
        )
        return {
            publicKey,
            privateKey,
            accountAddress: address,
        }
    }
}
