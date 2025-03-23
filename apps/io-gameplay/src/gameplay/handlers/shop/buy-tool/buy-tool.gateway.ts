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
import { BuyToolMessage } from "./buy-tool.dto"
import { BuyToolService } from "./buy-tool.service"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BuyToolGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyToolGateway.name)

    constructor(
        private readonly buyToolService: BuyToolService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyToolGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.BuyTool)
    public async buyTool(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyToolMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyToolService.buyTool(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 