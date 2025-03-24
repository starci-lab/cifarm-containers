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
import { DeliverMoreProductMessage } from "./deliver-more-product.dto"
import { DeliverMoreProductService } from "./deliver-more-product.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class DeliverMoreProductGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeliverMoreProductGateway.name)

    constructor(
        private readonly deliverMoreProductService: DeliverMoreProductService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeliverMoreProductGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.DeliverMoreProduct)
    public async deliverMoreProduct(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeliverMoreProductMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deliverMoreProductService.deliverMoreProduct(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 