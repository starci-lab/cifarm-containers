import { join } from "path"
import { GrpcName, GrpcConfig, GrpcNestConfig } from "./grpc.types"
import { Container, envConfig } from "@src/env"
import { getLoopbackAddress } from "@src/common"

export const grpcDataMap = (): Record<GrpcName, GrpcConfig> => ({
    [GrpcName.Gameplay]: {
        connection: {
            host: envConfig().containers[Container.GameplayService].host,
            port: envConfig().containers[Container.GameplayService].port
        },
        data: {
            name: "GAMEPLAY_PACKAGE",
            service: "GameplayService",
            package: "gameplay_service",
            protoPath: join(process.cwd(), "proto", "gameplay_service", "entry.proto")
        }
    }
})

export type GrpcConfigExtends = GrpcConfig & {
    url: string
    loopbackUrl: string
    nestConfig: GrpcNestConfig
}

export const getGrpcData = (grpcName: GrpcName = GrpcName.Gameplay): GrpcConfigExtends => {
    const {
        connection: { host, port },
        data: { name, package: _package, protoPath, service }
    } = grpcDataMap()[grpcName]
    const url = `${host}:${port}`
    return {
        connection: {
            host,
            port
        },
        data: {
            name,
            package: _package,
            protoPath,
            service
        },
        url,
        loopbackUrl: `${getLoopbackAddress()}:${port}`,
        nestConfig: {
            package: _package,
            protoPath,
            url
        }
    }
}
