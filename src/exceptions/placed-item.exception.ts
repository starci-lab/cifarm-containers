import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"

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

export class PlacedItemTileNotNeedUsePesticideException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not need use Pesticide: ${id}`)
    }
}

export class PlacedItemTileNotNeedUseHerbicideException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item tile not need use herbicide: ${id}`)
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

export class PlacedItemAnimalNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item animal not found: ${id}`)
    }
}

export class PlacedItemAnimalNotSickException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item animal not sick: ${id}`)
    }
}

export class HelpCureAnimalTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to help cure animal: ${error.message}`)
    }
}

export class HelpWaterTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to help water: ${error.message}`)
    }
}

export class BuildingAlreadyMaxUpgradeException extends GrpcAbortedException {
    constructor(placedItemId: string) {
        super(`Building already at maximum upgrade level for placed item: ${placedItemId}`)
    }
}

export class BuildingNextUpgradeNotFoundException extends GrpcNotFoundException {
    constructor(placedItemId: string) {
        super(`Building next upgrade not found for placed item: ${placedItemId}`)
    }
}

export class UpgradeBuildingTransactionFailedException extends GrpcAbortedException {
    constructor(error: Error) {
        super(`Upgrade building transaction failed: ${error.message}`)
    }
}

export class PlacedItemNotNeedUseFertilizerException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not need use fertilizer: ${id}`)
    }
}

export class UseFertilizerTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to use fertilizer: ${error.message}`)
    }
}

export class PlacedItemNotNeedFeedingException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not need feeding: ${id}`)
    }
}

export class FeedAnimalTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to feed animal: ${error.message}`)
    }
}

export class PlacedItemNotNeedCureException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not need cure: ${id}`)
    }
}

export class CureAnimalTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to cure animal: ${error.message}`)
    }
}
export class HelpUsePesticideTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to help use pesticide: ${error.message}`)
    }
}

export class HelpUseHerbicideTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Failed to help use herbicide: ${error.message}`)
    }
}

export class HaverstQuantityRemainingEqualMinHarvestQuantityException extends GrpcNotFoundException {
    constructor(minHarvestQuantity: number) {
        super(`Harvest quantity remaining equal min harvest quantity: ${minHarvestQuantity}`)
    }
}
