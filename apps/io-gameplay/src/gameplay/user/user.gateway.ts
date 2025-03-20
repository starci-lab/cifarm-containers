import { Logger } from "@nestjs/common"
import { OnGatewayInit, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets"
import { NAMESPACE } from "../gameplay.constants"
import { AuthGateway, SocketData } from "../auth"
import { TypedNamespace, TypedSocket } from "@src/io"
import {
    SYNC_USER_EVENT,
    USER_SYNCED_EVENT,
    SYNC_INVENTORIES_EVENT,
    INVENTORIES_SYNCED_EVENT
} from "./user.constants"
import { SubscribeMessage, ConnectedSocket } from "@nestjs/websockets"
import { Socket } from "socket.io"
import { SyncInventoriesPayload, SyncUserPayload, UserSyncedMessage, InventorySyncedMessage } from "./user.types"
import { UserService } from "./user.service"
@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class UserGateway implements OnGatewayInit {
    private readonly logger = new Logger(UserGateway.name)

    constructor(
        private readonly authGateway: AuthGateway,
        private readonly userService: UserService
    ) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UserGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public async syncInventories({
        inventories,
        requireQuery,
        userId
    }: SyncInventoriesPayload) {
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        console.log(inventories, requireQuery, userId)
        if (requireQuery) {
            if (!userId) {
                throw new Error("User ID not found")
            }
            inventories = await this.userService.getInventories(userId)
        }
        const data: InventorySyncedMessage = {
            inventories
        }
        socket.emit(INVENTORIES_SYNCED_EVENT, data)
    }

    public async syncUser({
        user,
        requireQuery,
        userId
    }: SyncUserPayload) {
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        if (requireQuery) {
            if (!userId) {
                throw new Error("User ID not found")
            }
            user = await this.userService.getUser(userId)
        }
        const data: UserSyncedMessage = {
            user
        }
        socket.emit(USER_SYNCED_EVENT, data)
    }   

    // force sync placed items
    @SubscribeMessage(SYNC_USER_EVENT)
    public async handleSyncUser(
        @ConnectedSocket() client: TypedSocket<SocketData>
    ): Promise<WsResponse<UserSyncedMessage>> {
        const userId = client.data.user.id
        const user = await this.userService.getUser(userId)
        const data: UserSyncedMessage = {
            user
        }
        return {
            event: USER_SYNCED_EVENT,
            data
        }
    }

    @SubscribeMessage(SYNC_INVENTORIES_EVENT)
    public async handleSyncInventories(
        @ConnectedSocket() client: Socket
    ): Promise<WsResponse<InventorySyncedMessage>> {
        const userId = client.data.user.id
        const inventories = await this.userService.getInventories(userId)
        const data: InventorySyncedMessage = {
            inventories
        }
        return {
            event: INVENTORIES_SYNCED_EVENT,
            data
        }
    }
}
