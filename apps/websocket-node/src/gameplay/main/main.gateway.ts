import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { SocketCoreService } from "@src/io/socket-core.service"
import { NAMESPACE } from "../gameplay.constants"
import { VisitedEmitter2Payload, ObservingData } from "./main.types"
import { VISIT_EVENT, VISITED_EMITTER2 } from "./main.constants"
import { EventEmitter2 } from "@nestjs/event-emitter"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(MainGateway.name)

    constructor(
        private readonly socketCoreService: SocketCoreService,
        private eventEmitter: EventEmitter2
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${MainGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    //process authentication
    public async handleConnection(@ConnectedSocket() socket: Socket) {
        const user = await this.socketCoreService.authenticate(socket)
        // join the room, indicate observering this user
        this.logger.verbose(`Client connected: ${socket.id}`)
        // set observing data
        const observing: ObservingData = {
            userId: user.id
        }
        socket.data.observing = observing
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        //disconnect
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }

    public getObservingData(client: Socket): ObservingData {
        return client.data.observing
    }

    public setObservingData(client: Socket, observing: ObservingData) {
        client.data.observing = observing
    }
    
    public getSocket(): Array<Socket> {
        return Array.from(this.namespace.sockets.values())
    }  

    @SubscribeMessage(VISIT_EVENT)
    public async handleVisit(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HandleVisitPayload
    ): Promise<void> {
        //leave the current room
        socket.leave(socket.data.observing.userId)

        //join the new room
        socket.join(payload.userId)

        //set observing data
        const observing: ObservingData = {
            userId: payload.userId
        }
        this.setObservingData(socket, observing)

        const emitter2Payload: VisitedEmitter2Payload = {
            userId: payload.userId,
            socketId: socket.id
        }
        this.eventEmitter.emit(VISITED_EMITTER2, emitter2Payload)
    }
}

export interface HandleVisitPayload {
    userId: string
}
