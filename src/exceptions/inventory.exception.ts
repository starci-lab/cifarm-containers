import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

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