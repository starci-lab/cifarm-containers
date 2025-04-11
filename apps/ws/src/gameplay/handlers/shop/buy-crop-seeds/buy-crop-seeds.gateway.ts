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
import { BuyCropSeedsMessage } from "./buy-crop-seeds.dto"
import { BuyCropSeedsService } from "./buy-crop-seeds.service"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyCropSeedsGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyCropSeedsGateway.name)

    constructor(
        private readonly buyCropSeedsService: BuyCropSeedsService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyCropSeedsGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyCropSeeds)
    public async buyCropSeeds(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyCropSeedsMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyCropSeedsService.buyCropSeeds(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.CropSeedsBought, payload)
    }
}
