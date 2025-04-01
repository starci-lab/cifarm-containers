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
import { UseAnimalMedicineMessage } from "./use-animal-medicine.dto"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"
import { UseThrottlerName, WsThrottlerGuard, ThrottlerName } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class UseAnimalMedicineGateway implements OnGatewayInit {
    private readonly logger = new Logger(UseAnimalMedicineGateway.name)

    constructor(
        private readonly useAnimalMedicineService: UseAnimalMedicineService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${UseAnimalMedicineGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    @UseThrottlerName(ThrottlerName.Large)
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.UseAnimalMedicine)
    public async useAnimalMedicine(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: UseAnimalMedicineMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.useAnimalMedicineService.useAnimalMedicine(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 