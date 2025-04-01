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
import { UseFruitFertilizerMessage } from "./use-fruit-fertilizer.dto"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseFruitFertilizerGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseFruitFertilizerGateway.name)

    constructor(
        private readonly useFruitFertilizerService: UseFruitFertilizerService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseFruitFertilizerGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseFruitFertilizer)
    public async useFruitFertilizer(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseFruitFertilizerMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useFruitFertilizerService.useFruitFertilizer(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 