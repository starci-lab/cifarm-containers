import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { NAMESPACE } from "../../../gameplay.constants"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { UpgradeBuildingMessage } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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
