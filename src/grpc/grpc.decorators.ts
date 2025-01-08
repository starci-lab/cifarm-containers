import { Inject } from "@nestjs/common"
import { GrpcServiceName } from "./grpc.types"
import { grpcData } from "./grpc.constants"

export const InjectGrpc = (grpcServiceName: GrpcServiceName = GrpcServiceName.Gameplay) => Inject(grpcData[grpcServiceName].name)