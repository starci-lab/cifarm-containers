import { GrpcAbortedException, GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class DeliverProductTransactionFailedException extends GrpcAbortedException {
    constructor(error: Error) {
        super(`Deliver product transaction failed: ${error.message}`)
    }
}

export class DeliveringProductNotFoundException extends GrpcNotFoundException {
    constructor(deliveringProductId: string) {
        super(`Delivering product not found: ${deliveringProductId}`)
    }
}

export class RetainProductTransactionFailedException extends GrpcAbortedException {
    constructor(deliveringProductId: string) {
        super(`Retain product transaction failed: ${deliveringProductId}`)
    }
}
