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
import { UpgradeBuildingMessage } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UpgradeBuildingGateway implements OnGatewayInit {
    private readonly logger = new Logger(UpgradeBuildingGateway.name)

    constructor(
        private readonly upgradeBuildingService: UpgradeBuildingService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UpgradeBuildingGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UpgradeBuilding)
    public async upgradeBuilding(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UpgradeBuildingMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.upgradeBuildingService.upgradeBuilding(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
}
