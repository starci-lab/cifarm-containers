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
import { RetrieveInventoriesMessage } from "./retrieve-inventories.dto"
import { RetrieveInventoriesService } from "./retrieve-inventories.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class RetrieveInventoriesGateway implements OnGatewayInit {
    private readonly logger = new Logger(RetrieveInventoriesGateway.name)

    constructor(
        private readonly retrieveInventoriesService: RetrieveInventoriesService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${RetrieveInventoriesGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.RetrieveInventories)
    public async retrieveInventories(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RetrieveInventoriesMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.retrieveInventoriesService.retrieveInventories(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 