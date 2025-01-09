import { Inject } from "@nestjs/common"
import { GrpcServiceName } from "./grpc.types"
import { getGrpcToken } from "./grpc.utils"

export const InjectGrpc = (grpcServiceName: GrpcServiceName = GrpcServiceName.Gameplay) =>
    Inject(getGrpcToken(grpcServiceName))
