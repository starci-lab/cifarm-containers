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
import { BuyFlowerSeedsService } from "./buy-flower-seeds.service"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { BuyFlowerSeedsMessage } from "./buy-flower-seeds.dto"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyFlowerSeedsGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyFlowerSeedsGateway.name)

    constructor(
        private readonly buyFlowerSeedsService: BuyFlowerSeedsService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyFlowerSeedsGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyFlowerSeeds)
    public async buyFlowerSeeds(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyFlowerSeedsMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyFlowerSeedsService.buyFlowerSeeds(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.FlowerSeedsBought, payload)
    }
}
    