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
import { SocketCoreService, SocketLike, TypedSocket } from "@src/io"
import { NAMESPACE } from "../gameplay.constants"
import { SocketData } from "./auth.types"

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
        this.joinRoom({ socket, userId: user.id, type: RoomType.Player })
        this.joinRoom({ socket, userId: user.id, type: RoomType.Watcher })
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }

    public getSockets(): Array<Socket> {
        return Array.from(this.namespace.sockets.values())
    }

    public joinRoom({ socket, userId, type = RoomType.Player }: JoinRoomNameParams) {
        socket.join(this.getRoomName({ userId, type }))
    }

    // method to leave the watching room
    public leaveWatchingRoom(socket: SocketLike<SocketData>) {
        const roomName = Array.from(socket.rooms).find((room) => room.startsWith(RoomType.Watcher))
        // do nothing if room name is not found
        if (!roomName) {
            throw new Error("Room name not found")
        }
        socket.leave(roomName)
    }

    // get player watching user id
    public getWatchingUserId(socket: SocketLike<SocketData>): string | undefined {
        const roomName = Array.from(socket.rooms).find((room) => room.startsWith(RoomType.Watcher))
        if (!roomName) {
            return
        }
        return this.getUserIdFromRoomName(roomName)
    }

    public getRoomName({ userId, type = RoomType.Player }: GetRoomNameParams): string {
        return `${type}_${userId}`
    }

    public getUserIdFromRoomName(roomName: string): string {
        return roomName.substring(roomName.indexOf("_") + 1)
    }

    // get socket by user id
    public async getSocket(
        namespace: TypedSocket<SocketData>,
        userId: string
    ): Promise<SocketLike<SocketData>> {
        const sockets = await namespace
            .in(
                this.getRoomName({
                    userId,
                    type: RoomType.Player
                })
            )
            .fetchSockets()
        return sockets[0]
    }
}

export enum RoomType {
    Player = "player",
    Watcher = "watcher"
}

export interface GetRoomNameParams {
    type?: RoomType
    userId: string
}

export interface JoinRoomNameParams {
    socket: SocketLike<SocketData>
    userId: string
    type?: RoomType
}
