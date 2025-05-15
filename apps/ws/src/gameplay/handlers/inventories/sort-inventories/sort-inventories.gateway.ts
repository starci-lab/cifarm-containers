import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { SortInventoriesService } from "./sort-inventories.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class SortInventoriesGateway implements OnGatewayInit {
    private readonly logger = new Logger(SortInventoriesGateway.name)

    constructor(
        private readonly sortInventoriesService: SortInventoriesService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${SortInventoriesGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.SortInventories)
    public async sortInventories(
        @ConnectedSocket() socket: Socket,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.sortInventoriesService.sortInventories(user)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 