import { join } from "path"
import { GrpcServiceName, GrpcServiceData } from "./grpc.types"

export const grpcData: Record<GrpcServiceName, GrpcServiceData> = {
    [GrpcServiceName.Gameplay]: {
        name: "GAMEPLAY_PACKAGE",
        service: "GameplayService",
        package: "gameplay_service",
        protoPath: join(process.cwd(), "proto", "gameplay_service", "entry.proto"),
    }
}
