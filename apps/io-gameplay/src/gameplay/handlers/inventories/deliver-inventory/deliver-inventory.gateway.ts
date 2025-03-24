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
import { DeliverInventoryMessage } from "./deliver-inventory.dto"
import { DeliverInventoryService } from "./deliver-inventory.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class DeliverInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeliverInventoryGateway.name)

    constructor(
        private readonly deliverInventoryService: DeliverInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeliverInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.DeliverInventory)
    public async deliverInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeliverInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deliverInventoryService.deliverInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 