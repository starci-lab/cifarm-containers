export class BlockchainException extends Error {
    constructor(
        message: string,
        public errorCode: BlockchainErrorCode
    ) {
        super(message)
    }
}

export enum BlockchainErrorCode {
    ChainKeyNotFound,
    PlatformNotFound
}