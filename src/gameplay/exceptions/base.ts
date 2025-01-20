export enum GameplayErrorCode {
    TokenCannotBeZeroOrNegative,
    UserInsufficientToken,
    GoldCannotBeZeroOrNegative,
    UserInsufficientGold,
}

export class GameplayException extends Error {
    constructor(
        message: string,
        public errorCode: GameplayErrorCode
    ) {
        super(message)
    }
}
