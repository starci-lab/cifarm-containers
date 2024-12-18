import { Logger, UseGuards } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Socket } from "socket.io"
import { LinkUserSessionResponse, SyncPlacedItemsParams } from "./broadcast.dto"
import { Server } from "socket.io"
import { DataSource } from "typeorm"
import { PlacedItemEntity } from "@src/database"
import { envConfig } from "@src/config"
import { WsJwtAuthGuard } from "@src/guards"
import { WsUser } from "@src/decorators"
import { UserLike } from "@src/services"
import { Cron } from "@nestjs/schedule"
import { WsSessionNotLinkedException } from "@src/exceptions"

const NAMESPACE = "broadcast"

@WebSocketGateway({
    cors: {
        origin: envConfig().cors.origin,
        credentials: true
    },
    namespace: NAMESPACE
})
export class BroadcastGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(BroadcastGateway.name)
    private readonly sessionMap = new Map<string, string>()

    constructor(
        private readonly dataSource: DataSource) {}

    afterInit() {
        this.logger.log(`Initialized gateway with namespace: ${NAMESPACE}`)
    }

    private checkSessionLinked(clientId: string): string {
        const userId = this.sessionMap.get(clientId)
        if (!userId) {
            throw new WsSessionNotLinkedException(clientId)
        }
        return userId
    }

    @Cron("*/1 * * * * *")
    public async broadcastPlacedItemsEverySecond() {
        const uniqueUserIds = new Set<string>(this.sessionMap.values())
        const userIds = Array.from(uniqueUserIds)
    
        // Create an array of promises for syncing placed items
        const promises = userIds.map(async (userId) => {
            await this.broadcastPlacedItems({
                userId,
            })
        })
    
        // Run all the promises in parallel
        await Promise.all(promises)
    }

    @WebSocketServer()
    private readonly server: Server

    public async broadcastPlacedItems({ userId }: SyncPlacedItemsParams) {
        //emit placed items to all clients
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItems = await queryRunner.manager.find(PlacedItemEntity, {
                where: {
                    userId
                }
            })
            this.server
                .to(userId)
                .emit("placed_items_updated", placedItems)
        } finally {
            await queryRunner.release()
        }
    }
    
    @SubscribeMessage("broadcast_placed_items")
    public async handleBroadcastPlacedItems(@ConnectedSocket() client: Socket) {
        //check if the user is in the room
        //get the user id from the session map
        const userId = this.checkSessionLinked(client.id)

        //find the clientid in room
        await this.broadcastPlacedItems({
            userId,
        })
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`)
        //unlink the session with the client id
        const userId = this.sessionMap.get(client.id)
        if (userId) {
            this.sessionMap.delete(client.id)
        }
    }

    public handleConnection(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`)
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage("link_user_session")
    public async linkUserSession(
        @WsUser() user: UserLike,
        @ConnectedSocket() client: Socket
    ): Promise<LinkUserSessionResponse> {
        this.logger.debug(`User authenticated: ${user.id} - ${client.id}`)
        //join the room with user id
        client.join(user.id)
        const socketsInRoom = await client.in(user.id).fetchSockets() // Get all sockets in the room
        socketsInRoom.forEach(socket => {
            if (socket.id !== client.id) {
                socket.disconnect(true) // Disconnect all clients except the current one
            }
        })
        //link the session with the user id
        this.sessionMap.set(client.id, user.id)

        return {}
    }
}
