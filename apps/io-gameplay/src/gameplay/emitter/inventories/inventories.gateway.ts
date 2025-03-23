import { Logger } from "@nestjs/common"
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { NAMESPACE } from "../../gameplay.constants"
import { AuthGateway, RoomType, SocketData } from "../../auth"
import { TypedNamespace } from "@src/io"
import { EmitterEventName } from "../../events"
import { SyncInventoriesPayload } from "./types"
import { InventoriesSyncedMessage } from "../../events"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class InventoriesGateway implements OnGatewayInit {
    private readonly logger = new Logger(InventoriesGateway.name)

    constructor(private readonly authGateway: AuthGateway) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${InventoriesGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public syncInventories({ data, userId }: SyncInventoriesPayload) {
        const messageResponse: InventoriesSyncedMessage = {
            data
        }
        this.namespace.to(
            this.authGateway.getRoomName({
                userId,
                type: RoomType.Player  
            })
        ).emit(EmitterEventName.InventoriesSynced, messageResponse)
    }
}
