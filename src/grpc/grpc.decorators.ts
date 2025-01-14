import { Inject } from "@nestjs/common"
import { GrpcName } from "./grpc.types"
import { getGrpcToken } from "./grpc.utils"

export const InjectGrpc = (grpcServiceName: GrpcName = GrpcName.Gameplay) =>
    Inject(getGrpcToken(grpcServiceName))
