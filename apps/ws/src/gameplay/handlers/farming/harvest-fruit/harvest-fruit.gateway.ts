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
import { HarvestFruitMessage } from "./harvest-fruit.dto"
import { HarvestFruitService } from "./harvest-fruit.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HarvestFruitGateway implements OnGatewayInit {
    private readonly logger = new Logger(HarvestFruitGateway.name)

    constructor(
        private readonly harvestFruitService: HarvestFruitService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HarvestFruitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HarvestFruit)
    public async harvestFruit(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HarvestFruitMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.harvestFruitService.harvestFruit(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 