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
import { HelpUseWateringCanMessage } from "./help-use-watering-can.dto"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"
import { ThrottlerName, UseThrottlerName, WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HelpUseWateringCanGateway implements OnGatewayInit {
    private readonly logger = new Logger(HelpUseWateringCanGateway.name)

    constructor(
        private readonly helpUseWateringCanService: HelpUseWateringCanService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HelpUseWateringCanGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HelpUseWateringCan)
    public async helpUseWateringCan(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HelpUseWateringCanMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.helpUseWateringCanService.helpUseWateringCan(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 