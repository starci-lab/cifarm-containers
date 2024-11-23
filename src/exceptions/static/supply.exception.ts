import { GrpcNotFoundException, GrpcResourceExhaustedException } from "nestjs-grpc-exceptions"

export class SupplyNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Supply not found: ${id}`)
    }
}

export class SupplyNotAvailableInShopException extends GrpcResourceExhaustedException {
    constructor(id: string) {
        super(`Supply not available in shop: ${id}`)
    }
}
