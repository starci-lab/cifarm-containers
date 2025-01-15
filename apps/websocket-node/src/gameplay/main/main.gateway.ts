import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { SocketCoreService } from "@src/io/socket-core.service"
import { NAMESPACE } from "../gameplay.constants"
import { ObservingData } from "./main.types"

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
        private readonly socketCoreService: SocketCoreService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(`Initialized gateway with name: ${MainGateway.name}, namespace: ${NAMESPACE}`)
    }

    //process authentication
    public async handleConnection(@ConnectedSocket() socket: Socket) {
        const user = await this.socketCoreService.authenticate(socket)
        // join the room, indicate observering this user
        this.logger.verbose(`Client connected: ${socket.id}`)
        // set observing data
        const observing : ObservingData = {
            userId: user.id,
        }
        socket.data.observing = observing
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        //disconnect
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }
}