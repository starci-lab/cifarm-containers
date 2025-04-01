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
import { BuySuppliesMessage } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuySuppliesGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuySuppliesGateway.name)

    constructor(
        private readonly buySuppliesService: BuySuppliesService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuySuppliesGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuySupplies)
    public async buySupplies(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuySuppliesMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buySuppliesService.buySupplies(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.SuppliesBought)
    }
} 