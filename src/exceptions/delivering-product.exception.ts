import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class DeliveringProductNotFoundException extends GrpcNotFoundException {
    constructor(deliveringProductId: string) {
        super(`Delivering product not found: ${deliveringProductId}`)
    }
}

