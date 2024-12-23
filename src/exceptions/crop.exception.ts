import { GrpcNotFoundException, GrpcResourceExhaustedException } from "nestjs-grpc-exceptions"

export class CropNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Crop not found: ${id}`)
    }
}

export class CropNotAvailableInShopException extends GrpcResourceExhaustedException {
    constructor(id: string) {
        super(`Crop not available in shop: ${id}`)
    }
}
