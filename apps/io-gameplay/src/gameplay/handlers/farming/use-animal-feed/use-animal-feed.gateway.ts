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
import { UseAnimalFeedMessage } from "./use-animal-feed.dto"
import { UseAnimalFeedService } from "./use-animal-feed.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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