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

export class PlacedItemTypeNotBuildingException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not a same type with animal: ${id}`)
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

export class BuildingNotSameAnimalException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not same animal: ${id}`)
    }
}
