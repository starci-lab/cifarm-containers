import { Logger } from "@nestjs/common"
import {
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket
} from "@nestjs/websockets"
import { Namespace } from "socket.io"
import { NAMESPACE } from "../../gameplay.constants"
import { PlacedItemsService } from "./placed-items.service"
import { PLACED_ITEMS_SYNCED_EVENT } from "./constants"
import { AuthGateway, RoomType, SocketData } from "../../auth"
import { EmitterEventName, PlacedItemsSyncedMessage, SyncPlacedItemsMessage } from "../../events"
import { TypedSocket } from "@src/io"
import { SchemaStatus } from "@src/common"
import { SyncPlacedItemsPayload } from "./types"
import { ReceiverEventName } from "../../events"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class PlacedItemsGateway implements OnGatewayInit {
    private readonly logger = new Logger(PlacedItemsGateway.name)

    constructor(
        private readonly authGateway: AuthGateway,
        private readonly placedItemsService: PlacedItemsService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${PlacedItemsGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    //sync placed items for all socket visting userId
    public async syncPlacedItems({ data, userId }: SyncPlacedItemsPayload) {
        const messageResponse: PlacedItemsSyncedMessage = {
            data
        }
        this.namespace
            .to(
                this.authGateway.getRoomName({
                    userId,
                    type: RoomType.Watcher
                })
            )
            .emit(PLACED_ITEMS_SYNCED_EVENT, messageResponse)
    }

    // force sync placed items
    @SubscribeMessage(ReceiverEventName.SyncPlacedItems)
    public async handleSyncPlacedItems(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { placedItemIds }: SyncPlacedItemsMessage
    ) {
        const placedItems = await this.placedItemsService.getPlacedItemsByIds({
            placedItemIds
        })

        const messageResponse: PlacedItemsSyncedMessage = {
            data: placedItems.map((placedItem) => ({
                ...placedItem,
                status: SchemaStatus.Updated
            }))
        }
        socket.emit(EmitterEventName.PlacedItemsSynced, messageResponse)
    }
}       