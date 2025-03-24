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
import { DeliverProductMessage } from "./deliver-product.dto"
import { DeliverProductService } from "./deliver-product.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class DeliverProductGateway implements OnGatewayInit {
    private readonly logger = new Logger(DeliverProductGateway.name)

    constructor(
        private readonly deliverProductService: DeliverProductService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${DeliverProductGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.DeliverProduct)
    public async deliverProduct(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: DeliverProductMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.deliverProductService.deliverProduct(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 