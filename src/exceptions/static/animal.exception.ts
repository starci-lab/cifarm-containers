import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class AnimalNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Animal not found: ${id}`)
    }
}
