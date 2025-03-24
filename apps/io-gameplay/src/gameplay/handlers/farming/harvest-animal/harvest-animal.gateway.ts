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
import { HarvestAnimalMessage } from "./harvest-animal.dto"
import { HarvestAnimalService } from "./harvest-animal.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class HarvestAnimalGateway implements OnGatewayInit {
    private readonly logger = new Logger(HarvestAnimalGateway.name)

    constructor(
        private readonly harvestAnimalService: HarvestAnimalService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HarvestAnimalGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.HarvestAnimal)
    public async harvestAnimal(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HarvestAnimalMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.harvestAnimalService.harvestAnimal(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 