import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class TileNotAvailableInShopException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Tile with id "${id}" is not available in the shop`)
    }
}

export class TileNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Tile with id "${id}" not found`)
    }
}