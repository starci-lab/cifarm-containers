import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class PlacedItemTypeNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Placed item type not found: ${id}`)
    }
}
