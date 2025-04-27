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
import { MoveInventoryWholesaleMarketMessage } from "./move-inventory-wholesale-market.dto"
import { MoveInventoryWholesaleMarketService } from "./move-inventory-wholesale-market.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class MoveInventoryWholesaleMarketGateway implements OnGatewayInit {
    private readonly logger = new Logger(MoveInventoryWholesaleMarketGateway.name)

    constructor(
        private readonly moveInventoryWholesaleMarketService: MoveInventoryWholesaleMarketService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${MoveInventoryWholesaleMarketGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.MoveInventoryWholesaleMarket)
    public async moveInventoryWholesaleMarket(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: MoveInventoryWholesaleMarketMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse =
            await this.moveInventoryWholesaleMarketService.moveInventoryWholesaleMarket(
                user,
                payload
            )
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
}
