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
import { ThiefFruitMessage } from "./thief-fruit.dto"
import { ThiefFruitService } from "./thief-fruit.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class ThiefFruitGateway implements OnGatewayInit {
    private readonly logger = new Logger(ThiefFruitGateway.name)

    constructor(
        private readonly thiefFruitService: ThiefFruitService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ThiefFruitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.ThiefFruit)
    public async thiefFruit(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: ThiefFruitMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.thiefFruitService.thiefFruit(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 