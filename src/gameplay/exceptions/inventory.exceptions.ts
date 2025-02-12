import { GameplayErrorCode, GameplayException } from "./base"

export class InventoryQuantityNotSufficientException extends GameplayException {
    constructor(quantity: number) {
        super(
            `Inventory quantity not sufficient. Quantity: ${quantity}`,
            GameplayErrorCode.InventoryQuantityNotSufficient
        )
    }
}