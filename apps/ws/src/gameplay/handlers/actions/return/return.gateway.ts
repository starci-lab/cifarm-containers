import { Logger } from "@nestjs/common"
import {
    SubscribeMessage,
    WebSocketServer,
    ConnectedSocket
} from "@nestjs/websockets"
import { AuthGateway, RoomType, SocketData } from "../../../auth"
import { TypedNamespace, TypedSocket } from "@src/io"
import { ReceiverEventName } from "../../../events"
import { UseThrottlerName, WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
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

    
    @UseGuards(WsThrottlerGuard)
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