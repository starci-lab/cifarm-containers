import { getWsUrl } from "@src/common"
import { IoService } from "./socket-io.types"
import { Container, envConfig } from "@src/env"

export const urlMap = (): Record<IoService, string> => ({
    [IoService.IoGameplay]: getWsUrl({
        host: envConfig().containers[Container.IoGameplay].host,
        port: envConfig().containers[Container.IoGameplay].port
    })
})

export const getSocketIoToken = (service: IoService = IoService.IoGameplay): string =>
    `SOCKET_IO_${service}`
