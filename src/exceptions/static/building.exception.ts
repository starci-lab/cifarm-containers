import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class BuildingNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not found: ${id}`)
    }
}

export class BuildingNotAvailableInShopException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Building not available in shop: ${id}`)
    }
}
