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
import { UseBugNetMessage } from "./use-bug-net.dto"
import { UseBugNetService } from "./use-bug-net.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseBugNetGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseBugNetGateway.name)

    constructor(
        private readonly useBugNetService: UseBugNetService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseBugNetGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseBugNet)
    public async useBugNet(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseBugNetMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useBugNetService.useBugNet(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 