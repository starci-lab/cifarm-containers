import {
    GrpcAbortedException,
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from "nestjs-grpc-exceptions"

export class InventoryNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Inventory not found : ${id}`)
    }
}

export class InventoryQuantityNotSufficientException extends GrpcNotFoundException {
    constructor(id: string, quantity: number) {
        super(`Inventory quantity not sufficient : ${id} (id), ${quantity} (quantity)`)
    }
}

export class InsufficientInventoryException extends GrpcInvalidArgumentException {
    constructor(inventoryId: string, requestedQuantity: number) {
        super(
            `Insufficient inventory for inventoryId: ${inventoryId}. Requested quantity: ${requestedQuantity} exceeds available stock.`
        )
    }
}

export class InventoryTypeNotDeliverableException extends GrpcAbortedException {
    constructor(inventoryId: string) {
        super(
            `Inventory with ID ${inventoryId} cannot be delivered as its type is not deliverable.`
        )
    }
}
