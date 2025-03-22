import { GameplayErrorCode, GameplayException } from "./base"

export class PositionNotAvailableException extends GameplayException {
    constructor() {
        super(
            "Position is not available",
            GameplayErrorCode.PositionNotAvailable
        )
    }
}