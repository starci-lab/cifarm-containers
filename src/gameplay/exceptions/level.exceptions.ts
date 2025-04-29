import { GameplayErrorCode, GameplayException } from "./base"

export class ExperienceCannotBeZeroOrNegativeException extends GameplayException {
    constructor(amount: number) {
        super(
            `Experience amount cannot be zero or negative: ${amount}`,
            GameplayErrorCode.ExperienceCannotBeZeroOrNegative
        )
    }
}

export class LevelGapIsNotEnoughException extends GameplayException {
    constructor() {
        super(
            "Level gap is not enough",
            GameplayErrorCode.LevelGapIsNotEnough
        )
    }
}
