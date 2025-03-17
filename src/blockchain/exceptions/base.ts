export class BlockchainException extends Error {
    constructor(
        message: string,
        public errorCode: BlockchainErrorCode
    ) {
        super(message)
    }
}

export enum BlockchainErrorCode {
    ChainKeyNotFound = "CHAIN_KEY_NOT_FOUND",
    PlatformNotFound = "PLATFORM_NOT_FOUND"
}