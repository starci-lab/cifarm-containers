import { getWsUrl } from "@src/common"
import { IoService } from "./socket-io.types"
import { Container, envConfig } from "@src/env"

export const urlMap = (): Record<IoService, string> => ({
    [IoService.Io]: getWsUrl({
        host: envConfig().containers[Container.Io].host,
        port: envConfig().containers[Container.Io].port
    })
})