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
import { UseAnimalFeedMessage } from "./use-animal-feed.dto"
import { UseAnimalFeedService } from "./use-animal-feed.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseAnimalFeedGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseAnimalFeedGateway.name)

    constructor(
        private readonly useAnimalFeedService: UseAnimalFeedService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseAnimalFeedGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseAnimalFeed)
    public async useAnimalFeed(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseAnimalFeedMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useAnimalFeedService.useAnimalFeed(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 