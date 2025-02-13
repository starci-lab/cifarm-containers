export enum GameplayErrorCode {
    TokenCannotBeZeroOrNegative,
    UserInsufficientToken,
    GoldCannotBeZeroOrNegative,
    UserInsufficientGold,
    InventoryQuantityNotSufficient,
    InventoryCapacityExceeded,
    ExperienceCannotBeZeroOrNegative,
    EnergyNotEnough,
    PhaseNotFound,
}

export class GameplayException extends Error {
    constructor(
        message: string,
        public errorCode: GameplayErrorCode
    ) {
        super(message)
    }
}
