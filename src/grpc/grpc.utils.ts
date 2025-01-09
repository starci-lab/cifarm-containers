import { grpcData } from "./grpc.constants"
import { GrpcServiceName } from "./grpc.types"
import { envConfig } from "@src/env"

export const getGrpcToken = (grpcServiceName: GrpcServiceName = GrpcServiceName.Gameplay) =>
    `GRPC_${grpcData[grpcServiceName].name}`

export interface GetGrpcUrl {
    host?: string
    port: number
}

export const getGrpcUrl = ({ host, port }: GetGrpcUrl): string => `${host}:${port}`

export const grpcUrlMap = (): Record<GrpcServiceName, string> => ({
    [GrpcServiceName.Gameplay]: getGrpcUrl({
        host: envConfig().containers.gameplayService.host,
        port: envConfig().containers.gameplayService.port
    })
})
