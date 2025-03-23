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
import { BuySuppliesMessage } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BuySuppliesGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuySuppliesGateway.name)

    constructor(
        private readonly buySuppliesService: BuySuppliesService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuySuppliesGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.BuySupplies)
    public async buySupplies(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuySuppliesMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buySuppliesService.buySupplies(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 