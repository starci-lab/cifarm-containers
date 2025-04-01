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
import { RetainInventoryMessage } from "./retain-inventory.dto"
import { RetainInventoryService } from "./retain-inventory.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class RetainInventoryGateway implements OnGatewayInit {
    private readonly logger = new Logger(RetainInventoryGateway.name)

    constructor(
        private readonly retainInventoryService: RetainInventoryService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${RetainInventoryGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.RetainInventory)
    public async retainInventory(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RetainInventoryMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.retainInventoryService.retainInventory(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 