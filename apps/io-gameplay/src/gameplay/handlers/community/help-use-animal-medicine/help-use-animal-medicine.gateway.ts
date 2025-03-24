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
import { HelpUseAnimalMedicineMessage } from "./help-use-animal-medicine.dto"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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