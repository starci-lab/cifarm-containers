import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class PlacedItemNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not found: ${id}`)
    }
}

export class PlacedItemTileNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not found: ${id}`)
    }
}

export class PlacedItemTileNotPlantedException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not planted: ${id}`)
    }
}

export class PlacedItemTileNotNeedWaterException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not need water: ${id}`)
    }
}

export class PlacedItemNotNeedUsePesticideException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not need use Pesticide: ${id}`)
    }
}

export class PlacedItemNotNeedUseHerbicideException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not need use herbicide: ${id}`)
    }
}

export class PlacedItemTileNotFullyMaturedException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not fully matured: ${id}`)
    }
}

export class PlacedItemTileAlreadyHasSeedException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile already has seed: ${id}`)
    }
}

export class PlacedItemTypeNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item type not found: ${id}`)
    }
}

export class PlacedItemIsLimitException extends Error {
    constructor(tileId: string) {
        super(`Tile with id "${tileId}" has reached its maximum ownership limit.`)
    }
}
