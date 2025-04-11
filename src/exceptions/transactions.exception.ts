import { GrpcInternalException } from "nestjs-grpc-exceptions"

export class VerifySignatureTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to verify signature: ${error.message}`)
    }
}

export class DailyRewardTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Daily reward transaction failed: ${error.message}`)
    }
}

export class SpinTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Spin transaction failed: ${error.message}`)
    }
}

export class HelpCureAnimalTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to help cure animal: ${error.message}`)
    }
}

export class HelpWaterTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to help water: ${error.message}`)
    }
}

export class ThiefAnimalProductTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Thief animal product transaction failed: ${error.message}`)
    }
}

export class ThiefCropTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Thief crop transaction failed: ${error.message}`)
    }
}

export class DeliverProductTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Deliver product transaction failed: ${error.message}`)
    }
}

export class RetrieveProductTransactionFailedException extends GrpcInternalException {
    constructor(deliveringProductId: string) {
        super(`Retrieve product transaction failed for product ID: ${deliveringProductId}`)
    }
}

export class SpeedUpTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Speed up transaction failed: ${error.message}`)
    }
}

export class HarvestAnimalTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Collect animal product transaction failed: ${error.message}`)
    }
}

export class CureAnimalTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to cure animal: ${error.message}`)
    }
}

export class HarvestCropTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to harvest crop: ${error.message}`)
    }
}

export class PlaceTileTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to place tile: ${error.message}`)
    }
}

export class PlantSeedTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to plant seed: ${error.message}`)
    }
}

export class UseFertilizerTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to use fertilizer: ${error.message}`)
    }
}

export class UsePesticideTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to use pesticide: ${error.message}`)
    }
}

export class UseHerbicideTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to use herbicide: ${error.message}`)
    }
}

export class UpdateTutorialTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to update tutorial: ${error.message}`)
    }
}

export class BuyAnimalTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Animal purchase transaction failed: ${error.message}`)
    }
}

export class BuySeedsTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to buy seeds: ${error.message}`)
    }
}

export class BuySuppliesTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to buy supplies: ${error.message}`)
    }
}

export class BuyTileTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Tile purchase transaction failed: ${error.message}`)
    }
}

export class BuyBuildingTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to construct building: ${error.message}`)
    }
}

export class UpgradeBuildingTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to upgrade building: ${error.message}`)
    }
}

export class CropsWorkerProcessTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to process crops worker: ${error.message}`)
    }
}
//EnergysWorkerProcessTransactionFailedException
export class EnergysWorkerProcessTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to process energy worker: ${error.message}`)
    }
}

//AnimalsWorkerProcessTransactionFailedException
export class AnimalsWorkerProcessTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to process animals worker: ${error.message}`)
    }
}

export class DeliverysWorkerProcessTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to process delivery worker: ${error.message}`)
    }
}

//MoveTransactionFailedException
export class MoveTransactionFailedException extends GrpcInternalException {
    constructor(error: Error) {
        super(`Failed to move: ${error.message}`)
    }
}