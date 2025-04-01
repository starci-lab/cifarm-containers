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
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { SellService } from "./sell.service"
import { SellMessage } from "./sell.dto"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class SellGateway implements OnGatewayInit {
    private readonly logger = new Logger(SellGateway.name)

    constructor(
        private readonly sellService: SellService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${SellGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.Sell)
    public async sell(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: SellMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.sellService.sell(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 