import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class BuildingNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not found: ${id}`)
    }
}

export class BuildingNotAvailableInShopException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not available in shop: ${id}`)
    }
}

export class ConstructBuildingTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to construct building due to: ${error}`)
    }
}

export class WaterTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to water plant due to: ${error}`)
    }
}

export class HaverstCropTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to harvest crop due to: ${error}`)
    }
}

export class UsePestisideTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to use pestiside due to: ${error}`)
    }
}

export class UseHerbicideTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to use herbicide due to: ${error}`)
    }
}

export class VerifySignatureCreateUserTransactionFailedException extends GrpcNotFoundException {
    constructor(error: Error) {
        super(`Failed to create user due to: ${error}`)
    }
}