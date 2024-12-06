import { join } from "path"

export enum GrpcServiceName {
    Gameplay = "gameplay"
}

export const grpcConfig: GrpcConfig = {
    [GrpcServiceName.Gameplay]: {
        name: "GAMEPLAY_PACKAGE",
        service: "GameplayService",
        package: "gameplay_service",
        protoPath: join(process.cwd(), "proto", "gameplay_service", "entry.proto")
    }
}

export type GrpcConfig = Record<GrpcServiceName, GrpcServiceDetails>

export interface GrpcServiceDetails {
    name: string
    service: string
    package: string
    protoPath: string
}