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
import { UseBugNetMessage } from "./use-bug-net.dto"
import { UseBugNetService } from "./use-bug-net.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class UseBugNetGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseBugNetGateway.name)

    constructor(
        private readonly useBugNetService: UseBugNetService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseBugNetGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.UseBugNet)
    public async useBugNet(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseBugNetMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useBugNetService.useBugNet(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 