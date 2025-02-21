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
import { SocketCoreService, SocketLike, TypedNamespace } from "@src/io"
import { NAMESPACE } from "../gameplay.constants"
import { SocketData } from "./auth.types"
import { PLAYER_PREFIX } from "./auth.constants"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE,
    transports: ["websocket"]
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(AuthGateway.name)

    constructor(private readonly socketCoreService: SocketCoreService<SocketData>) {}

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
        this.startWatchingUser(socket, user.id)
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }

    public getSockets(): Array<Socket> {
        return Array.from(this.namespace.sockets.values())
    }

    public startWatchingUser(socket: SocketLike<SocketData>, userId: string) {
        this.stopWatchingUser(socket)
        socket.join(this.getRoomName(userId))
    }

    // method to stop watching the player
    private stopWatchingUser(socket: SocketLike<SocketData>) {
        const roomName = Array.from(socket.rooms).find((room) => room.startsWith(PLAYER_PREFIX))
        // do nothing if room name is not found
        if (!roomName) {
            return
        }
        socket.leave(roomName)
    }

    // get player watching user id
    public getWatchingUserId(socket: SocketLike<SocketData>): string | undefined {
        const rooms = Array.from(socket.rooms).find((room) => room.startsWith(PLAYER_PREFIX))
        if (!rooms) {
            return
        }
        return this.getUserIdFromRoomName(rooms)
    }

    private getRoomName(userId: string): string {
        return `${PLAYER_PREFIX}_${userId}`
    }

    private getUserIdFromRoomName(roomName: string): string {
        return roomName.replace(PLAYER_PREFIX + "_", "")
    }

    // get the socket id via a namespace and user id
    public async getSocket(
        namespace: TypedNamespace<SocketData>,
        userId: string
    ): Promise<SocketLike<SocketData> | undefined> {
        const sockets = await namespace.in(this.getRoomName(userId)).fetchSockets()
        return sockets.find((socket) => socket.data.user.id === userId)
    }
}
