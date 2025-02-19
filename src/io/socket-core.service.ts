import { Injectable, Logger } from "@nestjs/common"
import { JwtService, UserLike } from "@src/jwt"
import { Namespace } from "socket.io"
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
        // return the user
        return user
    }

    // get the socket id via a namespace and user id
    public async getSocket(namespace: Namespace, userId: string): Promise<SocketLike<TSocketData>> {
        const sockets = await namespace.in(userId).fetchSockets()
        const socket = sockets.find((socket) => socket.data.user.id === userId)
        if (!socket) {
            const message = `No socket found for user ${userId}`
            this.logger.error(message)
            throw new Error(message)
        }
        return socket
    }

    public getUser(socket: SocketLike<TSocketData>): UserLike {
        return socket.data.user
    }
}
