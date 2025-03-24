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
import { RetainProductMessage } from "./retain-product.dto"
import { RetainProductService } from "./retain-product.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class RetainProductGateway implements OnGatewayInit {
    private readonly logger = new Logger(RetainProductGateway.name)

    constructor(
        private readonly retainProductService: RetainProductService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${RetainProductGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.RetainProduct)
    public async retainProduct(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: RetainProductMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.retainProductService.retainProduct(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 