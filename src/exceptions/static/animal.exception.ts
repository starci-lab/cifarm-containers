import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"

export class AnimalNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Animal not found: ${id}`)
    }
}

export class AnimalNotAvailableInShopException extends GrpcPermissionDeniedException {
    constructor(id: string) {
        super(`Animal  ${id} not available in shop `)
    }
}

export class ParentBuildingNotFoundException extends GrpcNotFoundException {
    constructor(buildingId: string) {
        super(`Parent building not found: ${buildingId}`)
    }
}

export class AnimalTypeMismatchException extends GrpcAbortedException {
    constructor(buildingType: string, animalType: string) {
        super(`Animal type ${animalType} does not match building type ${buildingType}`)
    }
}

export class BuildingCapacityExceededException extends GrpcAbortedException {
    constructor(message: string) {
        super(`Building capacity exceeded: ${message}`)
    }
}

export class BuyAnimalTransactionFailedException extends GrpcAbortedException {
    constructor(message: string) {
        super(`Animal purchase transaction failed: ${message}`)
    }
}

export class AfterAuthenticatedFirstTimeTransactionFailedException extends GrpcAbortedException {
    constructor(message: string) {
        super(`After authenticated first time transaction failed: ${message}`)
    }
}
