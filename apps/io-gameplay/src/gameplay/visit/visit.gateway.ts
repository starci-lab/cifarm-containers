import { Logger } from "@nestjs/common"
import {
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace } from "socket.io"
import { NAMESPACE } from "../gameplay.constants"
import { ReturnPayload, VisitedEmitter2Payload, VisitPayload } from "./visit.types"
import { VISITED_EMITTER2_EVENT } from "./visit.constants"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AuthGateway, SocketData } from "../auth"
import { ObservingData } from "../auth"
import { SocketCoreService } from "@src/io"

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
        private readonly socketCoreService: SocketCoreService<SocketData>,
        private eventEmitter: EventEmitter2
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${VisitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public async visit(
        { neighborUserId, userId }: VisitPayload
    ): Promise<void> {
        // get the corresponding socket for the user
        const socket = await this.socketCoreService.getSocket(this.namespace, userId)
        // leave the current room
        socket.leave(socket.data.observing.userId)
        // set observing data
        socket.join(neighborUserId)
        const observing: ObservingData = {
            userId: neighborUserId
        }
        this.authGateway.setObservingData(socket, observing)
        const emitter2Payload: VisitedEmitter2Payload = {
            userId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2_EVENT, emitter2Payload)
    }

    public async return(
        { userId }: ReturnPayload
    ): Promise<void> {
        // get the corresponding socket for the user
        const socket = await this.socketCoreService.getSocket(this.namespace, userId)
        // leave the current room
        socket.leave(socket.data.observing.userId)
        // set observing data
        socket.join(userId)
        const observing: ObservingData = {
            userId
        }
        this.authGateway.setObservingData(socket, observing)
        const emitter2Payload: VisitedEmitter2Payload = {
            userId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2_EVENT, emitter2Payload)
    }
}