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
import { BuyDecorationMessage } from "./buy-decoration.dto"
import { BuyDecorationService } from "./buy-decoration.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyDecorationGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyDecorationGateway.name)

    constructor(
        private readonly buyDecorationService: BuyDecorationService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyDecorationGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyDecoration)
    public async buyDecoration(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyDecorationMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyDecorationService.buyDecoration(user, payload)
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