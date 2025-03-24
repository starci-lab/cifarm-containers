import { Logger } from "@nestjs/common"
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket
} from "@nestjs/websockets"
import { NAMESPACE } from "../../../gameplay.constants"
import { AuthGateway, RoomType, SocketData } from "../../../auth"
import { TypedNamespace, TypedSocket } from "@src/io"
import { ReceiverEventName } from "../../../events"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE,
    transports: [ "websocket"]
})
export class ReturnGateway {
    private readonly logger = new Logger(ReturnGateway.name)

    constructor(
        private readonly authGateway: AuthGateway
    ) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ReturnGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.Return)
    public async return(
        @ConnectedSocket() socket: TypedSocket<SocketData>
    ): Promise<void> {
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        const userId = socket.data.user.id
        // start watching the original player
        this.authGateway.joinRoom({
            socket,
            userId,
            type: RoomType.Watcher
        })
    }
}