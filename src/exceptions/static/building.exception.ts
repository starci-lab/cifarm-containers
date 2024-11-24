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