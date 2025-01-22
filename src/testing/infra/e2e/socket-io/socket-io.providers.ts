import { Provider } from "@nestjs/common"
import { IoService } from "./socket-io.types"
import { getSocketIoToken, urlMap } from "./socket-io.utils"
import { io, Socket } from "socket.io-client"

export const createSocketIoFactoryProvider = (
    service: IoService = IoService.IoGameplay
): Provider => ({
    provide: getSocketIoToken(service),
    useFactory: (): Socket => {
        const url = urlMap()[service]
        return io(url)
    }
})
