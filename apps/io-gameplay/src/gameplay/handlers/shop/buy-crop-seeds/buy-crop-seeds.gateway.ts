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
import { BuyCropSeedsMessage } from "./buy-crop-seeds.dto"
import { BuyCropSeedsService } from "./buy-crop-seeds.service"
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BuyCropSeedsGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyCropSeedsGateway.name)

    constructor(
        private readonly buyCropSeedsService: BuyCropSeedsService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyCropSeedsGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.BuyCropSeeds)
    public async buyCropSeeds(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyCropSeedsMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyCropSeedsService.buyCropSeeds(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
        socket.emit(EmitterEventName.CropSeedsBought)
    }
}
