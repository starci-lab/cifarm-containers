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
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { BuyBuildingMessage } from "./buy-building.dto"
import { BuyBuildingService } from "./buy-building.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyBuildingGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyBuildingGateway.name)

    constructor(
        private readonly buyBuildingService: BuyBuildingService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyBuildingGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyBuilding)
    public async buyBuilding(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyBuildingMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyBuildingService.buyBuilding(user, payload)
        const { stopBuying, ...restSyncedResponse } = syncedResponse    
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse: restSyncedResponse
        })
        if (stopBuying) {
            socket.emit(EmitterEventName.StopBuying)
        }
    }
} 