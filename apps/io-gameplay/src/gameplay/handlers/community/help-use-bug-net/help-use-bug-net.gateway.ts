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
import { HelpUseBugNetMessage } from "./help-use-bug-net.dto"
import { HelpUseBugNetService } from "./help-use-bug-net.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class HelpUseBugNetGateway implements OnGatewayInit {
    private readonly logger = new Logger(HelpUseBugNetGateway.name)

    constructor(
        private readonly helpUseBugNetService: HelpUseBugNetService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HelpUseBugNetGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.HelpUseBugNet)
    public async helpUseBugNet(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HelpUseBugNetMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.helpUseBugNetService.helpUseBugNet(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 