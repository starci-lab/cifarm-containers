import { envConfig } from "@src/env"
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

export const grpcUrlMap = () : Record<GrpcServiceName, string> => ({
    [GrpcServiceName.Gameplay]: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`
})
