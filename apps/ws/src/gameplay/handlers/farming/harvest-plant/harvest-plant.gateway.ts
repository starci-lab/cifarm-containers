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
import { HarvestPlantMessage } from "./harvest-plant.dto"
import { HarvestPlantService } from "./harvest-plant.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HarvestPlantGateway implements OnGatewayInit {
    private readonly logger = new Logger(HarvestPlantGateway.name)

    constructor(
        private readonly harvestPlantService: HarvestPlantService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HarvestPlantGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HarvestPlant)
    public async harvestPlant(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HarvestPlantMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.harvestPlantService.harvestPlant(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 