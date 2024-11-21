import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class UserNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`User not found: ${id}`)
    }
}
