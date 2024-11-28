import { GrpcAbortedException } from "nestjs-grpc-exceptions"

export class DeliverProductTransactionFailedException extends GrpcAbortedException {
    constructor(error: Error) {
        super(`Deliver product transaction failed: ${error.message}`)
    }
}
