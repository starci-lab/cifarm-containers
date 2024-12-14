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
import { WsUser } from "@src/decorators"
import { WsJwtAuthGuard, WsUserLinkedGuard } from "@src/guards"
import { UserLike } from "@src/services"
import { Socket } from "socket.io"
import { BroadcastPlacedItemsParams } from "./broadcast.dto"
import { Namespace, namespaceConstants } from "../app.constants"
import { Server } from "socket.io"
import { DataSource } from "typeorm"
import { PlacedItemEntity } from "@src/database"
import { envConfig } from "@src/config"

@WebSocketGateway({
    cors: {
        origin: envConfig().cors.origin,
        credentials: true
    },
    namespace: namespaceConstants[Namespace.Broadcast].NAMESPACE
})

export class BroadcastGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(BroadcastGateway.name)

    constructor(private readonly dataSource: DataSource) {}

    afterInit() {
        this.logger.debug("Broadcast gateway initialized")
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id} - namespace: ${client.nsp.name}`)
    }

    public handleConnection(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client connected: ${client.id} - namespace: ${client.nsp.name}`)
    }

    @WebSocketServer()
    private readonly server: Server

    public async broadcastPlacedItems({ clientId, userId }: BroadcastPlacedItemsParams) {
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
                .to(clientId)
                .emit(namespaceConstants[Namespace.Broadcast].events.PLACED_ITEMS, placedItems)
        } finally {
            await queryRunner.release()
        }
    }

    @UseGuards(WsJwtAuthGuard, WsUserLinkedGuard)
    @SubscribeMessage(namespaceConstants[Namespace.Broadcast].events.PLACED_ITEMS)
    public async handlePlacedItems(@WsUser() user: UserLike, @ConnectedSocket() client: Socket) {
        await this.broadcastPlacedItems({
            userId: user.id,
            clientId: client.id
        })
    }

    // Hàm gửi sự kiện Hello World đến tất cả client
    public broadcastHelloWorld(): void {
        this.server.emit("hello_world", { message: "Hello World" })
    }

    @SubscribeMessage("request_hello_world")
    public handleHelloWorldRequest(@ConnectedSocket() client: Socket): void {
        client.emit("hello_world", { message: "Hello World" })
    }
}
