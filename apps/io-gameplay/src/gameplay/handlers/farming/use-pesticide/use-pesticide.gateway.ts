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
import { UsePesticideMessage } from "./use-pesticide.dto"
import { UsePesticideService } from "./use-pesticide.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class UsePesticideGateway implements OnGatewayInit {
    private readonly logger = new Logger(UsePesticideGateway.name)

    constructor(
        private readonly usePesticideService: UsePesticideService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UsePesticideGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.UsePesticide)
    public async usePesticide(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UsePesticideMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.usePesticideService.usePesticide(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 