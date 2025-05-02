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
import { SelectDogMessage } from "./select-dog.dto"
import { SelectDogService } from "./select-dog.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class SelectDogGateway implements OnGatewayInit {
    private readonly logger = new Logger(SelectDogGateway.name)

    constructor(
        private readonly selectDogService: SelectDogService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${SelectDogGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.SelectDog)
    public async selectDog(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: SelectDogMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.selectDogService.selectDog(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 