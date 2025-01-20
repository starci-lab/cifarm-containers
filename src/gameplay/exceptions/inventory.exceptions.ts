import { GameplayErrorCode, GameplayException } from "./base"

export class InventoryQuantityNotSufficientException extends GameplayException {
    constructor(id: string, quantity: number) {
        super(
            `Inventory quantity not sufficient. ID: ${id}, Quantity: ${quantity}`,
            GameplayErrorCode.InventoryQuantityNotSufficient
        )
    }
}