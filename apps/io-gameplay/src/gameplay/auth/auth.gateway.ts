import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { SocketCoreService } from "@src/io"
import { NAMESPACE } from "../gameplay.constants"
import { ObservingData } from "./auth.types"
import { EventEmitter2 } from "@nestjs/event-emitter"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE,
    transports: [ "websocket"]
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(AuthGateway.name)

    constructor(
        private readonly socketCoreService: SocketCoreService,
        private eventEmitter: EventEmitter2
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${AuthGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    //process authentication
    public async handleConnection(@ConnectedSocket() socket: Socket) {
        const user = await this.socketCoreService.authenticate(socket)
        if (!user) return
        // join the room, indicate observering this user
        this.logger.verbose(`Client connected: ${socket.id}`)
        // set observing data
        const observing: ObservingData = {
            userId: user.id
        }
        socket.data.observing = observing
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }

    public getObservingData(client: Socket): ObservingData {
        return client.data.observing
    }

    public setObservingData(client: Socket, observing: ObservingData) {
        client.data.observing = observing
    }
    
    public getSockets(): Array<Socket> {
        return Array.from(this.namespace.sockets.values())
    }  
}