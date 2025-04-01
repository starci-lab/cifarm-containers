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
import { HelpUsePesticideMessage } from "./help-use-pesticide.dto"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HelpUsePesticideGateway implements OnGatewayInit {
    private readonly logger = new Logger(HelpUsePesticideGateway.name)

    constructor(
        private readonly helpUsePesticideService: HelpUsePesticideService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HelpUsePesticideGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HelpUsePesticide)
    public async helpUsePesticide(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HelpUsePesticideMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.helpUsePesticideService.helpUsePesticide(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 