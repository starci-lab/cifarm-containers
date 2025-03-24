import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { NAMESPACE } from "../../../gameplay.constants"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { HelpUseWateringCanMessage } from "./help-use-watering-can.dto"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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