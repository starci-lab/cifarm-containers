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
import { NAMESPACE } from "../gameplay.constants"
import { PlacedItemsService } from "./placed-items.service"
import { PLACED_ITEMS_SYNCED_EVENT, SYNC_PLACED_ITEMS_EVENT } from "./constants"
import { AuthGateway, RoomType } from "../auth"
import { PlacedItemsSyncedMessage, SyncPlacedItemsMessageBody, SyncPlacedItemsPayload } from "./types"
import { TypedSocket } from "@src/io"
import { SocketData } from "../auth"
import { SchemaStatus } from "@src/common"

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
    public async syncPlacedItems({ placedItems, userId }: SyncPlacedItemsPayload) {
        const messageResponse: PlacedItemsSyncedMessage = {
            data: placedItems
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
    @SubscribeMessage(SYNC_PLACED_ITEMS_EVENT)
    public async handleSyncPlacedItems(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { placedItemIds }: SyncPlacedItemsMessageBody
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
        socket.emit(PLACED_ITEMS_SYNCED_EVENT, messageResponse)
    }
}