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
import { ThiefBeeHouseMessage } from "./thief-bee-house.dto"
import { ThiefBeeHouseService } from "./thief-bee-house.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class ThiefBeeHouseGateway implements OnGatewayInit {
    private readonly logger = new Logger(ThiefBeeHouseGateway.name)

    constructor(
        private readonly harvestBeeHouseService: ThiefBeeHouseService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ThiefBeeHouseMessage.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.ThiefBeeHouse)
    public async harvestBeeHouse(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: ThiefBeeHouseMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.harvestBeeHouseService.thiefBeeHouse(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 