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
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { BuyAnimalMessage } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class BuyAnimalGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyAnimalGateway.name)

    constructor(
        private readonly buyAnimalService: BuyAnimalService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyAnimalGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.BuyAnimal)
    public async buyAnimal(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyAnimalMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyAnimalService.buyAnimal(user, payload)
        const { stopBuying, ...restSyncedResponse } = syncedResponse
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse: restSyncedResponse
        })
        if (stopBuying) {
            socket.emit(EmitterEventName.StopBuying)
        }
    }
} 