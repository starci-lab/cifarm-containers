import { Logger } from "@nestjs/common"
import { OnGatewayInit, WebSocketServer } from "@nestjs/websockets"
import { AuthGateway, RoomType, SocketData } from "../../auth"
import { TypedNamespace } from "@src/io"
import { EmitterEventName } from "../../events"
import {
    SyncUserPayload,
    UserSyncedMessage
} from "./user.types"
import { GameplayWebSocketGateway, NAMESPACE } from "../../gateway.decorators"

@GameplayWebSocketGateway()
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

    public syncUser({ data, userId }: SyncUserPayload) {
        const messageResponse: UserSyncedMessage = {
            data
        }
        this.namespace.to(
            this.authGateway.getRoomName({
                userId,
                type: RoomType.Player
            })
        ).emit(EmitterEventName.UserSynced, messageResponse)
    }
}
