import { Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { InjectPostgreSQL, PlacedItemEntity } from "@src/databases"
import { Namespace, Socket } from "socket.io"
import { DataSource } from "typeorm"
import { SyncPlacedItemsParams } from "./broadcast.dto"
import { SocketCoreService } from "@src/io/socket-base.service"

const NAMESPACE = "broadcast"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BroadcastGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(BroadcastGateway.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly socketCoreService: SocketCoreService
    ) {}

    @WebSocketServer()
    private readonly server: Namespace

    afterInit() {
        this.logger.verbose(`Initialized gateway with namespace: ${NAMESPACE}`)
    }

    //process authentication
    public handleConnection(@ConnectedSocket() client: Socket) {
        //authenticate, otherwise disconnect
        this.socketCoreService.authenticate(client)
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        //disconnect the socket
        this.socketCoreService.disconnect(client)
    }

    @Cron("*/1 * * * * *")
    public async broadcastPlacedItemsEverySecond() {
        const socketIds = Array.from(this.server.adapter.sids.keys())

        // Create an array of promises for syncing placed items
        const promises = socketIds.map(async (socketId) => {
            const userId = await this.socketCoreService.getUserId(socketId)
            await this.broadcastPlacedItems({
                userId
            })
        })

        // Run all the promises in parallel
        await Promise.all(promises)
    }

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
            this.server.to(userId).emit("placed_items_updated", placedItems)
        } finally {
            await queryRunner.release()
        }
    }

    @SubscribeMessage("broadcast_placed_items")
    public async handleBroadcastPlacedItems(@ConnectedSocket() client: Socket) {
        //find the clientid in room
        await this.broadcastPlacedItems({
            userId
        })
    }
}
