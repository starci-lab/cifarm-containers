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
import { UseWateringCanMessage } from "./use-watering-can.dto"
import { UseWateringCanService } from "./use-watering-can.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class UseWateringCanGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseWateringCanGateway.name)

    constructor(
        private readonly useWateringCanService: UseWateringCanService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseWateringCanGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.UseWateringCan)
    public async useWateringCan(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseWateringCanMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useWateringCanService.useWateringCan(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 