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
import { PlantSeedMessage } from "./plant-seed.dto"
import { PlantSeedService } from "./plant-seed.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class PlantSeedGateway implements OnGatewayInit {
    private readonly logger = new Logger(PlantSeedGateway.name)

    constructor(
        private readonly plantSeedService: PlantSeedService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${PlantSeedGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.PlantSeed)
    public async plantSeed(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: PlantSeedMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.plantSeedService.plantSeed(user, payload)
        console.log(syncedResponse)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 