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
import { DeleteInventoryMessage } from "./delete-inventory.dto"
import { DeleteInventoryService } from "./delete-inventory.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class DeleteInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeleteInventoryGateway.name)

    constructor(
        private readonly deleteInventoryService: DeleteInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeleteInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.DeleteInventory)
    public async deleteInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeleteInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deleteInventoryService.deleteInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 