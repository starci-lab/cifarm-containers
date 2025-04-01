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
import { BuyToolMessage } from "./buy-tool.dto"
import { BuyToolService } from "./buy-tool.service"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyToolGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyToolGateway.name)

    constructor(
        private readonly buyToolService: BuyToolService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyToolGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyTool)
    public async buyTool(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyToolMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyToolService.buyTool(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.ToolBought)
    }
} 