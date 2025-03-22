import { Logger } from "@nestjs/common"
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { NAMESPACE } from "../gameplay.constants"
import { AuthGateway, RoomType, SocketData } from "../auth"
import { TypedNamespace } from "@src/io"
import { USER_SYNCED_EVENT, INVENTORIES_SYNCED_EVENT } from "./user.constants"
import {
    InventoriesSyncedMessage,
    SyncInventoriesPayload,
    SyncUserPayload,
    UserSyncedMessage
} from "./user.types"
@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class UserGateway implements OnGatewayInit {
    private readonly logger = new Logger(UserGateway.name)

    constructor(private readonly authGateway: AuthGateway) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UserGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public syncInventories({ inventories, userId }: SyncInventoriesPayload) {
        const messageResponse: InventoriesSyncedMessage = {
            data: inventories
        }
        this.namespace.to(
            this.authGateway.getRoomName({
                userId,
                type: RoomType.Player  
            })
        ).emit(INVENTORIES_SYNCED_EVENT, messageResponse)
    }

    public syncUser({ user, userId }: SyncUserPayload) {
        const messageResponse: UserSyncedMessage = {
            data: user
        }
        this.namespace.to(
            this.authGateway.getRoomName({
                userId,
                type: RoomType.Player
            })
        ).emit(USER_SYNCED_EVENT, messageResponse)
    }
}
