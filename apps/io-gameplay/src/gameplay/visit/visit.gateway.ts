import { Logger } from "@nestjs/common"
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket
} from "@nestjs/websockets"
import { NAMESPACE } from "../gameplay.constants"
import { ReturnPayload, VisitMessageBody } from "./types"
import { VISIT_EVENT, RETURN_EVENT  } from "./constants"
import { AuthGateway, RoomType, SocketData } from "../auth"
import { TypedNamespace, TypedSocket } from "@src/io"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE,
    transports: [ "websocket"]
})
export class VisitGateway {
    private readonly logger = new Logger(VisitGateway.name)

    constructor(
        private readonly authGateway: AuthGateway
    ) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${VisitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(VISIT_EVENT)
    public async handleVisit(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { neighborUserId }: VisitMessageBody
    ): Promise<void> {
        console.log("handleVisit", neighborUserId)
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        // start watching the player
        this.authGateway.joinRoom({
            socket,
            userId: neighborUserId,
            type: RoomType.Watcher
        })
    }

    @SubscribeMessage(RETURN_EVENT)
    public async handleReturn(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { userId }: ReturnPayload
    ): Promise<void> {
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        // start watching the original player
        this.authGateway.joinRoom({
            socket,
            userId,
            type: RoomType.Watcher
        })
    }
}