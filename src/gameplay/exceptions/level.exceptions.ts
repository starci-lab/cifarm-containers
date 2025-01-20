import { GameplayErrorCode, GameplayException } from "./base"

export class ExperienceCannotBeZeroOrNegativeException extends GameplayException {
    constructor(amount: number) {
        super(
            `Experience amount cannot be zero or negative: ${amount}`,
            GameplayErrorCode.ExperienceCannotBeZeroOrNegative
        )
    }
}