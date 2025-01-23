import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { NAMESPACE } from "../gameplay.constants"
import { VisitedEmitter2Payload, VisitPayload } from "./visit.types"
import { VISIT_EVENT, VISITED_EMITTER2_EVENT } from "./visit.constants"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AuthGateway } from "../auth"
import { ObservingData } from "../auth"

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
        private readonly authGateway: AuthGateway,
        private eventEmitter: EventEmitter2
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${VisitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(VISIT_EVENT)
    public async handleVisit(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: VisitPayload
    ): Promise<void> {
        //leave the current room
        await socket.leave(socket.data.observing.userId)

        //join the new room
        await socket.join(payload.userId)
        const socketsInRoom = this.namespace.adapter.rooms.get(payload.userId)
        this.logger.verbose(`Sockets in room ${payload.userId}: ${socketsInRoom?.size}`)
        //set observing data
        const observing: ObservingData = {
            userId: payload.userId
        }
        this.authGateway.setObservingData(socket, observing)

        const emitter2Payload: VisitedEmitter2Payload = {
            userId: payload.userId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2_EVENT, emitter2Payload)
    }
}