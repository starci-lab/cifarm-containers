import { Logger } from "@nestjs/common"
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket
} from "@nestjs/websockets"
import { NAMESPACE } from "../../../gameplay.constants"
import { VisitMessage } from "./visit.dto"
import { AuthGateway, RoomType, SocketData } from "../../../auth"
import { TypedNamespace, TypedSocket } from "@src/io"
import { ReceiverEventName } from "../../../events"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE,
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

    @SubscribeMessage(ReceiverEventName.Visit)
    public async handleVisit(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { neighborUserId }: VisitMessage
    ): Promise<void> {
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        // start watching the player
        this.authGateway.joinRoom({
            socket,
            userId: neighborUserId,
            type: RoomType.Watcher
        })
    }
}