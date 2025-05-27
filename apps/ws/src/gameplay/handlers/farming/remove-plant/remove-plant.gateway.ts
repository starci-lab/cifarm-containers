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
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"
import { RemovePlantMessage } from "./remove-plant.dto"
import { RemovePlantService } from "./remove-plant.service"

@GameplayWebSocketGateway()
export class RemovePlantGateway implements OnGatewayInit {
    private readonly logger = new Logger(RemovePlantGateway.name)

    constructor(
        private readonly removePlantService: RemovePlantService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${RemovePlantGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.RemovePlant)
    public async removePlant(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RemovePlantMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.removePlantService.removePlant(user, payload)
        console.log(syncedResponse)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 