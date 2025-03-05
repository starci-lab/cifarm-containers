import { Injectable, Logger } from "@nestjs/common"
import { JwtService, UserLike } from "@src/jwt"
import { SocketLike, TypedSocket, AbstractSocketData } from "./io.types"

@Injectable()
export class SocketCoreService<TSocketData extends AbstractSocketData> {
    private logger = new Logger(SocketCoreService.name)
    constructor(private readonly jwtService: JwtService) {}

    // method to authenticate the socket
    public async authenticate(socket: TypedSocket<TSocketData>): Promise<UserLike | undefined> {
        // add headers for postman testing
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token
        // if no token, disconnect
        if (!token) {
            this.logger.debug(`${socket.id} - No auth token`)
            socket.disconnect()
            return
        }

        // verify the token
        const user = await this.jwtService.verifyToken(token)
        if (!user) {
            this.logger.debug(`${socket.id} - Unauthorized`)
            socket.disconnect()
            return
        }

        // set the user id in the socket data, indicate this socket is related to this user
        socket.data.user = user
        socket.join(this.getRoomName(user.id))
        // return the user
        return user
    }

    public getUser(socket: SocketLike<TSocketData>): UserLike {
        return socket.data.user
    }

    // base room name, useful for retrieving the socket
    public getRoomName(userId: string): string {
        return `user-${userId}`
    }

    // get socket by user id
    public async getSocket(
        namespace: TypedSocket<TSocketData>,
        userId: string
    ): Promise<SocketLike<TSocketData>> {
        const sockets = await namespace.in(this.getRoomName(userId)).fetchSockets()
        return sockets[0]
    }
}
