import { Logger } from "@nestjs/common"
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace, Socket } from "socket.io"
import { UserLike } from "@src/jwt"
import { WsUser } from "@src/decorators"
import { ReceiverEventName } from "../../../events"
import { EmitterService } from "../../../emitter"
import { PlaceNFTMessage } from "./place-nft.dto"
import { PlaceNFTService } from "./place-nft.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class PlaceNFTGateway implements OnGatewayInit {
    private readonly logger = new Logger(PlaceNFTGateway.name)

    constructor(
        private readonly placeNFTService: PlaceNFTService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${PlaceNFTGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.PlaceNFT)
    public async placeNFT(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: PlaceNFTMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.placeNFTService.placeNFT(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 