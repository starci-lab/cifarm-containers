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
import { UseFertilizerMessage } from "./use-fertilizer.dto"
import { UseFertilizerService } from "./use-fertilizer.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseFertilizerGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseFertilizerGateway.name)

    constructor(
        private readonly useFertilizerService: UseFertilizerService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseFertilizerGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseFertilizer)
    public async useFertilizer(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseFertilizerMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useFertilizerService.useFertilizer(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 