import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import {  WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class ClaimDailyRewardGateway implements OnGatewayInit {
    private readonly logger = new Logger(ClaimDailyRewardGateway.name)

    constructor(
        private readonly claimDailyRewardService: ClaimDailyRewardService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ClaimDailyRewardGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.ClaimDailyReward)
    public async claimDailyReward(@ConnectedSocket() socket: Socket, @WsUser() user: UserLike) {
        const syncedResponse = await this.claimDailyRewardService.claimDailyReward(user)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.DailyRewardClaimed)
    }
}
