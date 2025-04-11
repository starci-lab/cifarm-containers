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
import { RetrieveInventoryMessage } from "./retrieve-inventory.dto"
import { RetrieveInventoryService } from "./retrieve-inventory.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class RetrieveInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(RetrieveInventoryGateway.name)

    constructor(
        private readonly retrieveInventoryService: RetrieveInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${RetrieveInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.RetrieveInventory)
    public async retrieveInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RetrieveInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.retrieveInventoryService.retrieveInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 