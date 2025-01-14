import { getGrpcData } from "./grpc.constants"
import { GrpcName } from "./grpc.types"

export const getGrpcToken = (grpcServiceName: GrpcName = GrpcName.Gameplay) =>
    `GRPC_${getGrpcData(grpcServiceName).data.name}`