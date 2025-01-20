import { BlockchainException, BlockchainErrorCode } from "./base"

export class ChainKeyNotFoundException extends BlockchainException {
    constructor(chainKey: string) {
        super(`Chain key not found: ${chainKey}`, BlockchainErrorCode.ChainKeyNotFound)
    }
}
