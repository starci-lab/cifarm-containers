import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@src/jwt"
import { Socket } from "socket.io"
import { Cache } from "cache-manager"
import { InjectCache } from "@src/cache"

@Injectable()
export class SocketCoreService {
    private logger = new Logger(SocketCoreService.name)
    constructor(
        @InjectCache()
        private readonly cache: Cache,
        private readonly jwtService: JwtService
    ) {}

    // method to authenticate the socket
    public async authenticate(socket: Socket) {
        const token = socket.handshake?.auth?.token
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

        // disconnect all other sockets with the same user id
        const socketsInRoom = await socket.in(user.id).fetchSockets() // Get all sockets in the room
        socketsInRoom.forEach((socketInRoom) => {
            if (socketInRoom.id !== socket.id) {
                socket.disconnect(true) // Disconnect all clients except the current one
            }
        })

        // link the user id with the socket id
        await this.cache.set(this.createSocketKey(socket.id), user.id, 0)
        // set the user in the socket data
        socket.data.user = user
        return true
    }

    // method to disconnect the socket
    public async disconnect(socket: Socket) {
        const key = this.createSocketKey(socket.id)
        const userId = await this.cache.get(key)
        if (userId) {
            await this.cache.del(key)
        }
    }

    // method to get the user from the socket id
    public async getUserId(socketId: string): Promise<string> {
        const key = this.createSocketKey(socketId)
        return await this.cache.get(key)
    }

    public async getSocketId(socket: Socket, userId: string): Promise<string> {
        const sockets = await socket.in(userId).fetchSockets()
        return sockets.at(0).id
    }

    private createSocketKey(socketId: string): string {
        return `socket:${socketId}`
    }
}
