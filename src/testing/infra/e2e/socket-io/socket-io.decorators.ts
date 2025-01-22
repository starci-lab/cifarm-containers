import { Inject } from "@nestjs/common"
import { IoService } from "./socket-io.types"
import { getSocketIoToken } from "./socket-io.utils"

export const InjectSocketIo = (service: IoService = IoService.IoGameplay) =>
    Inject(getSocketIoToken(service))
