import { GameplayErrorCode, GameplayException } from "./base"

export class EnergyNotEnoughException extends GameplayException {
    constructor(current: number, required: number) {
        super(
            `Energy not enough: ${current} (current), ${required} (required)`,
            GameplayErrorCode.EnergyNotEnough
        )
    }
}
