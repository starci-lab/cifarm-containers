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
import { HelpUseHerbicideMessage } from "./help-use-herbicide.dto"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HelpUseHerbicideGateway implements OnGatewayInit {
    private readonly logger = new Logger(HelpUseHerbicideGateway.name)

    constructor(
        private readonly helpUseHerbicideService: HelpUseHerbicideService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HelpUseHerbicideGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HelpUseHerbicide)
    public async helpUseHerbicide(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HelpUseHerbicideMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.helpUseHerbicideService.helpUseHerbicide(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 