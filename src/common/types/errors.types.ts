
import { RpcException } from "@nestjs/microservices"
import { status as GrpcStatusCode  } from "@grpc/grpc-js"

export class GrpcFailedPreconditionException extends RpcException {
    constructor(error: string | object) {
        super(errorObject(error, GrpcStatusCode.FAILED_PRECONDITION))
    }
}

export type GrpcExceptionPayload = {
  message: string;
  code: GrpcStatusCode | number;
};

export function errorObject(
    error: string | object,
    code: GrpcStatusCode,
): GrpcExceptionPayload {
    return {
        message: JSON.stringify({
            error,
            type: typeof error === "string" ? "string" : "object",
            exceptionName: RpcException.name,
        }),
        code,
    }
}