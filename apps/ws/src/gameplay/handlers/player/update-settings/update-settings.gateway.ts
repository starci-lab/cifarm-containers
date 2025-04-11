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
import { UpdateSettingsMessage } from "./update-settings.dto"
import { UpdateSettingsService } from "./update-settings.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UpdateSettingsGateway implements OnGatewayInit {
    private readonly logger = new Logger(UpdateSettingsGateway.name)

    constructor(
        private readonly updateSettingsService: UpdateSettingsService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UpdateSettingsGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UpdateSettings)
    public async updateSettings(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UpdateSettingsMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.updateSettingsService.updateSettings(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 