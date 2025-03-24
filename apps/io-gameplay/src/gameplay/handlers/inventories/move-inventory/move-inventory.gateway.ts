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
import { MoveInventoryMessage } from "./move-inventory.dto"
import { MoveInventoryService } from "./move-inventory.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class MoveInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(MoveInventoryGateway.name)

    constructor(
        private readonly moveInventoryService: MoveInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${MoveInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    @SubscribeMessage(ReceiverEventName.MoveInventory)
    public async moveInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MoveInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.moveInventoryService.moveInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 