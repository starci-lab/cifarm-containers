import { Logger } from "@nestjs/common"
import {
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { NAMESPACE } from "../gameplay.constants"
import { ReturnPayload, ShowFadeMessage, VisitedEmitter2Payload, VisitPayload } from "./visit.types"
import { SHOW_FADE_EVENT, VISITED_EMITTER2_EVENT } from "./visit.constants"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AuthGateway, RoomType, SocketData } from "../auth"
import { TypedNamespace } from "@src/io"

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
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${VisitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public async visit(
        { neighborUserId, userId }: VisitPayload
    ): Promise<void> {
        // get the corresponding socket for the user
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        // start watching the player
        this.authGateway.joinRoom({
            socket,
            userId: neighborUserId,
            type: RoomType.Watcher
        })
        // emit the event to show the backdrop
        const showFadeMessage: ShowFadeMessage = {
            toNeighbor: true
        }
        socket.emit(SHOW_FADE_EVENT, showFadeMessage)
        // emit the event to the other player
        const emitter2Payload: VisitedEmitter2Payload = {
            userId: neighborUserId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2_EVENT, emitter2Payload)
    }

    public async return(
        { userId }: ReturnPayload
    ): Promise<void> {
        // get the corresponding socket for the user
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        // stop watching the original player
        this.authGateway.leaveWatchingRoom(socket)
        // start watching the original player
        this.authGateway.joinRoom({
            socket,
            userId,
            type: RoomType.Watcher
        })
        // emit the event to show the backdrop
        const showFadeMessage: ShowFadeMessage = {
            toNeighbor: false
        }
        socket.emit(SHOW_FADE_EVENT, showFadeMessage)
        // emit the event to the other player
        const emitter2Payload: VisitedEmitter2Payload = {
            userId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2_EVENT, emitter2Payload)
    }
}