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
import { UseHerbicideMessage } from "./use-herbicide.dto"
import { UseHerbicideService } from "./use-herbicide.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseHerbicideGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseHerbicideGateway.name)

    constructor(
        private readonly useHerbicideService: UseHerbicideService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseHerbicideGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseHerbicide)
    public async useHerbicide(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseHerbicideMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useHerbicideService.useHerbicide(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 