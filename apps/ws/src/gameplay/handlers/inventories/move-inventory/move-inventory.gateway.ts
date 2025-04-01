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
import { MoveInventoryMessage } from "./move-inventory.dto"
import { MoveInventoryService } from "./move-inventory.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
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
    
    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
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