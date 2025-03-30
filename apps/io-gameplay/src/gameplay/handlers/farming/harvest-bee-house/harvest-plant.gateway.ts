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
import { HarvestBeeHouseMessage } from "./harvest-bee-house.dto"
import { HarvestBeeHouseService } from "./harvest-bee-house.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class HarvestBeeHouseGateway implements OnGatewayInit {
    private readonly logger = new Logger(HarvestBeeHouseGateway.name)

    constructor(
        private readonly harvestBeeHouseService: HarvestBeeHouseService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HarvestBeeHouseGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.HarvestPlant)
    public async harvestPlant(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HarvestBeeHouseMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.harvestBeeHouseService.harvestBeeHouse(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 