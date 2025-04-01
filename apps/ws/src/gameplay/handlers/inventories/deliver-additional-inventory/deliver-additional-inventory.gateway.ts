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
import { DeliverAdditionalInventoryMessage } from "./deliver-additional-inventory.dto"
import { DeliverAdditionalInventoryService } from "./deliver-additional-inventory.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class DeliverAdditionalInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeliverAdditionalInventoryGateway.name)

    constructor(
        private readonly deliverAdditionalInventoryService: DeliverAdditionalInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeliverAdditionalInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.DeliverAdditionalInventory)
    public async deliverAdditionalInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeliverAdditionalInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deliverAdditionalInventoryService.deliverAdditionalInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 