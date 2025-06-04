import { GameplayErrorCode, GameplayException } from "./base"

export class BulkNotFoundException extends GameplayException {
    constructor() {
        super(
            "Bulk not found",
            GameplayErrorCode.BulkNotFound
        )
    }
}

export class ProductNotFoundException extends GameplayException {
    constructor() {
        super(
            "Product not found",
            GameplayErrorCode.ProductNotFound
        )
    }
}

export class SeasonNotFoundException extends GameplayException {
    constructor() {
        super(
            "Season not found",
            GameplayErrorCode.SeasonNotFound
        )
    }
}