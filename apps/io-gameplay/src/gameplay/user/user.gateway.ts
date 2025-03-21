import { Logger } from "@nestjs/common"
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { NAMESPACE } from "../gameplay.constants"
import { AuthGateway, SocketData } from "../auth"
import { TypedNamespace } from "@src/io"
import {
    USER_SYNCED_EVENT,
    INVENTORIES_SYNCED_EVENT
} from "./user.constants"
import { InventoriesSyncedMessage, SyncInventoriesPayload, SyncUserPayload, UserSyncedMessage } from "./user.types"
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
        private readonly authGateway: AuthGateway
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
        userId
    }: SyncInventoriesPayload) {
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        const messageResponse: InventoriesSyncedMessage = {
            data: inventories
        }
        socket.emit(INVENTORIES_SYNCED_EVENT, messageResponse)
    }

    public async syncUser({
        user,
        userId
    }: SyncUserPayload) {
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        const messageResponse: UserSyncedMessage = {
            data: user
        }
        socket.emit(USER_SYNCED_EVENT, messageResponse)
    }   
}
