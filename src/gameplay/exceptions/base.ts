export enum GameplayErrorCode {
    TokenCannotBeZeroOrNegative = "TOKEN_CANNOT_BE_ZERO_OR_NEGATIVE",
    UserInsufficientToken = "USER_INSUFFICIENT_TOKEN",
    GoldCannotBeZeroOrNegative = "GOLD_CANNOT_BE_ZERO_OR_NEGATIVE",
    UserInsufficientGold = "USER_INSUFFICIENT_GOLD",
    InventoryQuantityNotSufficient = "INVENTORY_QUANTITY_NOT_SUFFICIENT",
    InventoryCapacityExceeded = "INVENTORY_CAPACITY_EXCEEDED",
    ExperienceCannotBeZeroOrNegative = "EXPERIENCE_CANNOT_BE_ZERO_OR_NEGATIVE",
    EnergyNotEnough = "ENERGY_NOT_ENOUGH",
    PhaseNotFound = "PHASE_NOT_FOUND",
    PositionNotAvailable = "POSITION_NOT_AVAILABLE",
    LevelGapIsNotEnough = "LEVEL_GAP_IS_NOT_ENOUGH",
    InventoryNotStackable = "INVENTORY_NOT_STACKABLE",
    BulkNotFound = "BULK_NOT_FOUND",
    ProductNotFound = "PRODUCT_NOT_FOUND",
    SeasonNotFound = "SEASON_NOT_FOUND",
    tCIFARMCannotBeZeroOrNegative = "TCIFARM_CANNOT_BE_ZERO_OR_NEGATIVE"
}

export class GameplayException extends Error {
    constructor(
        message: string,
        public errorCode: GameplayErrorCode
    ) {
        super(message)
    }
}
