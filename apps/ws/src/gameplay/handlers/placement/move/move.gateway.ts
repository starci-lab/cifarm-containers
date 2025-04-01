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
import { MoveService } from "./move.service"
import { MoveMessage } from "./move.dto"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class MoveGateway implements OnGatewayInit {
    private readonly logger = new Logger(MoveGateway.name)

    constructor(
        private readonly moveService: MoveService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${MoveGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.Move)
    public async move(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MoveMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.moveService.move(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 