import { Injectable, Logger } from "@nestjs/common"
import { JwtService, UserLike } from "@src/jwt"
import { Socket } from "socket.io"

@Injectable()
export class SocketCoreService {
    private logger = new Logger(SocketCoreService.name)
    constructor(private readonly jwtService: JwtService) {}

    // method to authenticate the socket
    public async authenticate(socket: Socket): Promise<UserLike | undefined> {
        // add headers for postman testing
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token
        console.log(socket.handshake)
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

    public async getSocketId(socket: Socket, userId: string): Promise<string> {
        const sockets = await socket.in(userId).fetchSockets()
        return sockets.at(0).id
    }

    public async getUserId(socket: Socket): Promise<string> {
        return socket.data.userId
    }
}
