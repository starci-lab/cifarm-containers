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
import { ThiefAnimalMessage } from "./thief-animal.dto"
import { ThiefAnimalService } from "./thief-animal.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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