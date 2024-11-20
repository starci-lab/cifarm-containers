import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class UserNotFoundException extends GrpcNotFoundException {
    constructor(userId: string) {
        super(`User not found: ${userId}`)
    }
}
