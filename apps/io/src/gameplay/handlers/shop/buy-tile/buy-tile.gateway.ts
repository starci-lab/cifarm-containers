import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { BuyTileMessage } from "./buy-tile.dto"
import { BuyTileService } from "./buy-tile.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyTileGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyTileGateway.name)

    constructor(
        private readonly buyTileService: BuyTileService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyTileGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyTile)
    public async buyTile(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyTileMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyTileService.buyTile(user, payload)
        const { stopBuying, ...restSyncedResponse } = syncedResponse
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse: restSyncedResponse
        })
        if (stopBuying) {
            socket.emit(EmitterEventName.StopBuying)
        }
    }
} 