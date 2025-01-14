import { HttpStatus } from "@nestjs/common"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class GrpcCacheNotFound extends GrpcNotFoundException {
    constructor(key: string) {
        super(`Cache entry with key not found: ${key}`)
    }
}
