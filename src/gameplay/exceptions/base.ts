export enum GameplayErrorCode {
    TokenCannotBeZeroOrNegative,
    UserInsufficientToken,
    GoldCannotBeZeroOrNegative,
    UserInsufficientGold,
    InventoryQuantityNotSufficient,
    ExperienceCannotBeZeroOrNegative,
    EnergyNotEnough,
}

export class GameplayException extends Error {
    constructor(
        message: string,
        public errorCode: GameplayErrorCode
    ) {
        super(message)
    }
}
