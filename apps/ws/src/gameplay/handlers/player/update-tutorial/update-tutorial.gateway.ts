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
import { UpdateTutorialMessage } from "./update-tutorial.dto"
import { UpdateTutorialService } from "./update-tutorial.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UpdateTutorialGateway implements OnGatewayInit {
    private readonly logger = new Logger(UpdateTutorialGateway.name)

    constructor(
        private readonly updateTutorialService: UpdateTutorialService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UpdateTutorialGateway.name}, namespace: ${NAMESPACE}`
        )
    }
    
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UpdateTutorial)
    public async updateTutorial(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UpdateTutorialMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.updateTutorialService.updateTutorial(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 