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
import { AuthGateway, RoomType, SocketData } from "../../auth"
import { EmitterEventName, PlacedItemsSyncedMessage } from "../../events"
import { TypedSocket } from "@src/io"
import { SchemaStatus } from "@src/common"
import { RequestDisplayTimersMessage, SyncPlacedItemsPayload } from "./types"
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
            .emit(EmitterEventName.PlacedItemsSynced, messageResponse)
        console.log(this.authGateway.getRoomName({
            userId,
            type: RoomType.Watcher
        }))
    }

    // force sync placed items
    @SubscribeMessage(ReceiverEventName.RequestDisplayTimers)
    public async handleRequestDisplayTimers(
        @ConnectedSocket() socket: TypedSocket<SocketData>,
        @MessageBody() { ids }: RequestDisplayTimersMessage
    ) {
        const placedItems = await this.placedItemsService.getPlacedItemsByIds({
            placedItemIds: ids
        })
        const messageResponse: PlacedItemsSyncedMessage = {
            data: placedItems.map((placedItem) => ({
                ...placedItem,
                status: SchemaStatus.Updated
            }))
        }
        socket.emit(EmitterEventName.PlacedItemsSynced, messageResponse)
        // timer synced for the corresponding ids
        socket.emit(EmitterEventName.DisplayTimersResponsed, {
            ids
        })
    }
}       

