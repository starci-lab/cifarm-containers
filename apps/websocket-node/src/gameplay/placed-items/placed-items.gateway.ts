import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
    WsResponse
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { PlacedItemsMessage } from "./placed-items.dto"
import { Cron } from "@nestjs/schedule"
import { NAMESPACE } from "../gameplay.constants"
import { PlacedItemsService } from "./placed-items.service"
import { PLACED_ITEMS_SYNCED, SYNC_PLACED_ITEMS } from "./placed-items.constants"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { VISITED_EMITTER2, MainGateway, VisitedEmitter2Payload } from "../main"

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
        private readonly mainGateway: MainGateway,
        private readonly placedItemsService: PlacedItemsService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(`Initialized gateway with name: ${PlacedItemsGateway.name}, namespace: ${NAMESPACE}`)
    }

    //sync state every second
    @Cron("*/1 * * * * *")
    public async processSyncPlacedItemsEverySecond() {
        //get all socket ids in this node
        const sockets = this.mainGateway.getSocket()

        //emit placed items to all clients
        const promises: Array<Promise<void>> = []
        for (const socket of sockets) {
            const observing = this.mainGateway.getObservingData(socket)
            if (observing && observing.userId) {
                promises.push(
                    (async () => {
                        const placedItems = await this.placedItemsService.getPlacedItems({
                            userId: observing.userId
                        })
                        socket.emit(PLACED_ITEMS_SYNCED, {
                            placedItems
                        })
                    })()
                )
            } 
        }
        await Promise.all(promises)
    }

    //sync placed items for all socket visting userId
    public async syncPlacedItems({ userId }: SyncPlacedItemsParams) {
        // get all sockets in the room, accross cluster
        const sockets = await this.namespace.in(userId).fetchSockets()
        // emit placed items to all clients
        const promises: Array<Promise<void>> = []
        for (const client of sockets) {
            promises.push(
                (async () => {
                    const placedItems = await this.placedItemsService.getPlacedItems({
                        userId
                    })
                    client.emit(PLACED_ITEMS_SYNCED, {
                        placedItems
                    })
                })()
            )
        }   
        await Promise.all(promises)
    }

    // force sync placed items
    @SubscribeMessage(SYNC_PLACED_ITEMS)
    public async handleSyncPlacedItems(
        @ConnectedSocket() client: Socket
    ): Promise<WsResponse<PlacedItemsMessage>> {
        //emit placed items to all clients
        const observing = this.mainGateway.getObservingData(client)
        if (!observing || !observing.userId) {
            throw new WsException("Observing user id not found")
        }
        const placedItems = await this.placedItemsService.getPlacedItems({
            userId: observing.userId
        })
        return {
            event: PLACED_ITEMS_SYNCED,
            data: {
                placedItems
            }
        }
    }

    @OnEvent(VISITED_EMITTER2)
    public async handleVisitedEmitter2(payload: VisitedEmitter2Payload) {
        const placedItems = await this.placedItemsService.getPlacedItems({
            userId: payload.userId
        })
        this.namespace.to(payload.socketId).emit(PLACED_ITEMS_SYNCED, {
            placedItems
        })
    }
}

export interface SyncPlacedItemsParams {
    userId: string
}