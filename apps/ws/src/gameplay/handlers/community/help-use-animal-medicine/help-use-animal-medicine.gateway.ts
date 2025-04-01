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
import { HelpUseAnimalMedicineMessage } from "./help-use-animal-medicine.dto"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"
import { GameplayWebSocketGateway, NAMESPACE } from "../../../gateway.decorators"

@GameplayWebSocketGateway()
export class HelpUseAnimalMedicineGateway implements OnGatewayInit {
    private readonly logger = new Logger(HelpUseAnimalMedicineGateway.name)

    constructor(
        private readonly helpUseAnimalMedicineService: HelpUseAnimalMedicineService,
        private readonly emitterService: EmitterService
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${HelpUseAnimalMedicineGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage(ReceiverEventName.HelpUseAnimalMedicine)
    public async helpUseAnimalMedicine(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: HelpUseAnimalMedicineMessage,
        @WsUser() user: UserLike
    ) {
        const syncedResponse = await this.helpUseAnimalMedicineService.helpUseAnimalMedicine(user, payload)
        this.emitterService.syncResponse({
            userId: user.id,
            syncedResponse
        })
    }
} 