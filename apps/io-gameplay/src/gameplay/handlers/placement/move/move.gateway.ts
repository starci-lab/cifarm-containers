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
import { MoveService } from "./move.service"
import { MoveMessage } from "./move.dto"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class MoveGateway implements OnGatewayInit {
    private readonly logger = new Logger(MoveGateway.name)

    constructor(
        private readonly moveService: MoveService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${MoveGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    @SubscribeMessage(ReceiverEventName.Move)
    public async move(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MoveMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.moveService.move(user, payload)
        console.log(syncedResponse)
        console.log(user)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 