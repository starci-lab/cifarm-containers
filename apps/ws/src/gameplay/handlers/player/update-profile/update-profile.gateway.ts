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
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"
import { UpdateProfileService } from "./update-profile.service"
import { UpdateProfileMessage } from "./update-profile.dto"

@GameplayWebSocketGateway()
export class UpdateProfileGateway implements OnGatewayInit {
    private readonly logger = new Logger(UpdateProfileGateway.name)

    constructor(
        private readonly updateProfileService: UpdateProfileService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UpdateProfileGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UpdateProfile)
    public async updateProfile(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UpdateProfileMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.updateProfileService.updateProfile(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 