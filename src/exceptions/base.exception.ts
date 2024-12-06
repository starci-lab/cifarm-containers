import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"

export class GrpcInvalidGuidException extends GrpcInvalidArgumentException {
    constructor(guid: string) {
        super(`Invalid GUID: ${guid}`)
    }
}
