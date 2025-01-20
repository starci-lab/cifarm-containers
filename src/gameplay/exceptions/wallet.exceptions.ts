import { GameplayException, GameplayErrorCode } from "./base"

export class TokenCannotBeZeroOrNegativeException extends GameplayException {
    constructor(amount: number) {
        super(
            `Token amount cannot be zero or negative: ${amount}`,
            GameplayErrorCode.TokenCannotBeZeroOrNegative
        )
    }
}

export class UserInsufficientTokenException extends GameplayException {
    constructor(current: number, required: number) {
        super(
            `User has insufficient tokens. Current: ${current}, Required: ${required}`,
            GameplayErrorCode.UserInsufficientToken
        )
    }
}

export class GoldCannotBeZeroOrNegativeException extends GameplayException {
    constructor(amount: number) {
        super(
            `Gold amount cannot be zero or negative: ${amount}`,
            GameplayErrorCode.GoldCannotBeZeroOrNegative
        )
    }
}

export class UserInsufficientGoldException extends GameplayException {
    constructor(current: number, required: number) {
        super(
            `User has insufficient gold. Current: ${current}, Required: ${required}`,
            GameplayErrorCode.UserInsufficientGold
        )
    }
}