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
import { ThiefAnimalMessage } from "./thief-animal.dto"
import { ThiefAnimalService } from "./thief-animal.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class ThiefAnimalGateway implements OnGatewayInit {
    private readonly logger = new Logger(ThiefAnimalGateway.name)

    constructor(
        private readonly thiefAnimalService: ThiefAnimalService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ThiefAnimalGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.ThiefAnimal)
    public async thiefAnimal(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: ThiefAnimalMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.thiefAnimalService.thiefAnimal(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 