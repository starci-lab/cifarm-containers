import { GameplayErrorCode, GameplayException } from "./base"

export class PhaseNotFoundException extends GameplayException {
    constructor(step: number) {
        super(
            `Phase not found for step: ${step}`,
            GameplayErrorCode.PhaseNotFound
        )
    }
}
