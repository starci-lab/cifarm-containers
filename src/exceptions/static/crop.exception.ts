import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

export class CropNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`Crop not found: ${id}`)
    }
}
