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
import { EmitterEventName, ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { BuyFruitMessage } from "./buy-fruit.dto"
import { BuyFruitService } from "./buy-fruit.service"
@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BuyFruitGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyFruitGateway.name)

    constructor(
        private readonly buyFruitService: BuyFruitService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyFruitGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.BuyFruit)
    public async buyFruit(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyFruitMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyFruitService.buyFruit(user, payload)
        const { stopBuying, ...restSyncedResponse } = syncedResponse
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse: restSyncedResponse
        })
        if (stopBuying) {   
            socket.emit(EmitterEventName.StopBuying)
        }
    }
} 