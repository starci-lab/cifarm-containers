export class BlockchainException extends Error  {
    constructor(
        message: string,
        public type: BlockchainExceptionType
    ) {
        super(message)
    }
}

export enum BlockchainExceptionType {
    ChainKeyNotFound,
    PlatformNotFound
}

export class ChainKeyNotFoundException extends BlockchainException {
    constructor(chainKey: string) {
        super(`Chain key not found: ${chainKey}`, BlockchainExceptionType.ChainKeyNotFound)
    }
}