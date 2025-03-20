import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { PlacedItemsSyncedMessage, SyncPlacedItemsParams } from "./placed-items.types"
import { NAMESPACE } from "../gameplay.constants"
import { PlacedItemsService } from "./placed-items.service"
import { PLACED_ITEMS_SYNCED_EVENT, SYNC_PLACED_ITEMS_EVENT } from "./placed-items.constants"
import { OnEvent } from "@nestjs/event-emitter"
import { AuthGateway, RoomType } from "../auth"
import { VISITED_EMITTER2_EVENT, VisitedEmitter2Payload } from "../visit"

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
    public async syncPlacedItems({ userId }: SyncPlacedItemsParams) {
        // emit placed items to all clients
        const placedItems = await this.placedItemsService.getPlacedItems({
            userId
        })
        const data: PlacedItemsSyncedMessage = {
            placedItems,
            userId
        }
        this.namespace
            .to(
                this.authGateway.getRoomName({
                    userId,
                    type: RoomType.Watcher
                })
            )
            .emit(PLACED_ITEMS_SYNCED_EVENT, data)
    }

    // force sync placed items
    @SubscribeMessage(SYNC_PLACED_ITEMS_EVENT)
    public async handleSyncPlacedItems(
        @ConnectedSocket() client: Socket
    ): Promise<WsResponse<PlacedItemsSyncedMessage>> {
        const userId = this.authGateway.getWatchingUserId(client)
        const placedItems = await this.placedItemsService.getPlacedItems({
            userId
        })
        const data: PlacedItemsSyncedMessage = {
            placedItems,
            userId
        }
        return {
            event: PLACED_ITEMS_SYNCED_EVENT,
            data
        }
    }

    @OnEvent(VISITED_EMITTER2_EVENT)
    public async handleVisitedEmitter2(payload: VisitedEmitter2Payload) {
        const placedItems = await this.placedItemsService.getPlacedItems({
            userId: payload.userId
        })
        const data: PlacedItemsSyncedMessage = {
            placedItems,
            userId: payload.userId
        }
        this.namespace
            .to(
                payload.socketId
            )
            .emit(PLACED_ITEMS_SYNCED_EVENT, data)
    }
}
