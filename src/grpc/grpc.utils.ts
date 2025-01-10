import { getLoopbackAddress } from "@src/common"
import { grpcData } from "./grpc.constants"
import { GrpcServiceName } from "./grpc.types"
import { envConfig } from "@src/env"

export const getGrpcToken = (grpcServiceName: GrpcServiceName = GrpcServiceName.Gameplay) =>
    `GRPC_${grpcData[grpcServiceName].name}`

export interface GetGrpcUrl {
    host?: string
    port: number
    useLoopbackAddress?: boolean
}

export const getGrpcUrl = ({ host, port, useLoopbackAddress }: GetGrpcUrl): string =>
    useLoopbackAddress ? getLoopbackAddress(port) : `${host}:${port}`

export const grpcUrlMap = (
    useLoopbackAddress: boolean = false
): Record<GrpcServiceName, string> => ({
    [GrpcServiceName.Gameplay]: getGrpcUrl({
        host: envConfig().containers.gameplayService.host,
        port: envConfig().containers.gameplayService.port,
        useLoopbackAddress
    })
})
