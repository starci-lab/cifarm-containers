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
import { DeliverInventoriesMessage } from "./deliver-inventories.dto"
import { DeliverInventoriesService } from "./deliver-inventories.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class DeliverInventoriesGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeliverInventoriesGateway.name)

    constructor(
        private readonly deliverInventoriesService: DeliverInventoriesService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeliverInventoriesGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.DeliverInventories)
    public async deliverInventories(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeliverInventoriesMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deliverInventoriesService.deliverInventories(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 