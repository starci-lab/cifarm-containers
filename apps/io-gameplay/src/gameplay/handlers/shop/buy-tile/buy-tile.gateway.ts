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
import { BuyTileMessage } from "./buy-tile.dto"
import { BuyTileService } from "./buy-tile.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class BuyTileGateway implements OnGatewayInit {
    private readonly logger = new Logger(BuyTileGateway.name)

    constructor(
        private readonly buyTileService: BuyTileService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${BuyTileGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @SubscribeMessage(ReceiverEventName.BuyTile)
    public async buyTile(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: BuyTileMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.buyTileService.buyTile(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 