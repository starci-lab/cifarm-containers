import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { SocketCoreService, SocketLike, TypedSocket } from "@src/io"
import { SocketData } from "./auth.types"
import { GameplayWebSocketGateway, NAMESPACE } from "../gateway.decorators"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { DateUtcService } from "@src/date"
import { EmitterEventName } from "../events"

@GameplayWebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(AuthGateway.name)

    constructor(
        private readonly dateUtcService: DateUtcService,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly socketCoreService: SocketCoreService<SocketData>
    ) { }

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${AuthGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    //process authentication
    public async handleConnection(@ConnectedSocket() socket: Socket) {
        try {
            const user = await this.socketCoreService.authenticate(socket)
            if (!user) return
            // join the room, indicate observering this user
            this.logger.verbose(`Client connected: ${socket.id}`)
            this.joinRoom({ socket, userId: user.id, type: RoomType.Player })
            this.joinRoom({ socket, userId: user.id, type: RoomType.Watcher })
            // update the user's isOnline to true
            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne({ _id: user.id }, { $set: { isOnline: true } })
        } catch (error) {
            this.logger.error(error)
        }
    }

    async handleDisconnect(@ConnectedSocket() socket: TypedSocket<SocketData>) {
        if (!socket.data.user) {
            return
        }
        const session = await this.connection.startSession()
        try {
            // if socket is disconnected before user is set, do nothing
            await session.withTransaction(async () => {
                // when disconnected, update the last online time
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: socket.data.user.id },
                        {
                            $set: {
                                lastOnlineTime: this.dateUtcService.getDayjs().toDate(),
                                isOnline: false
                            }
                        }
                    ).session(session)
            })
        } catch (error) {
            this.logger.error(error)
        } finally {
            await session.endSession()
        }
        this.logger.verbose(`Client disconnected: ${socket.id}`)
    }

    public getSockets(): Array<Socket> {
        return Array.from(this.namespace.sockets.values())
    }

    public async joinRoom({ socket, userId, type = RoomType.Player }: JoinRoomNameParams) {
        const roomName = this.getRoomName({ userId, type })
        if (type === RoomType.Player) {
            // if someone is already in the room, disconnect them
            // get sockets in the room on all nodes
            const sockets = await this.namespace.in(roomName).fetchSockets()
            for (const _socket of sockets) {
                // emit last message
                _socket.emit(EmitterEventName.YourAccountHasBeenLoggedInFromAnotherDevice)
                _socket.disconnect()
            }
        }
        socket.join(roomName)
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

    public getRoomName({ userId, type = RoomType.Player }: GetRoomNameParams): string {
        return `${type}_${userId}`
    }

    public getUserIdFromRoomName(roomName: string): string {
        return roomName.substring(roomName.indexOf("_") + 1)
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
