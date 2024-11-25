import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class PlacedItemNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item not found: ${id}`)
    }
}
