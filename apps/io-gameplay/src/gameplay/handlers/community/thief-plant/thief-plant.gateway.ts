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
import { ThiefPlantMessage } from "./thief-plant.dto"
import { ThiefPlantService } from "./thief-plant.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class ThiefPlantGateway implements OnGatewayInit {
    private readonly logger = new Logger(ThiefPlantGateway.name)

    constructor(
        private readonly thiefPlantService: ThiefPlantService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ThiefPlantGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.ThiefPlant)
    public async thiefPlant(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: ThiefPlantMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.thiefPlantService.thiefPlant(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 