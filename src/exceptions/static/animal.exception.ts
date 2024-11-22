import { GrpcNotFoundException, GrpcPermissionDeniedException } from "nestjs-grpc-exceptions"

export class AnimalNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Animal not found: ${id}`)
    }
}

export class AnimalNotAvailableInShopException extends GrpcPermissionDeniedException {
    constructor(id: string) {
        super(`Animal  ${id} not available in shop `)
    }
}
