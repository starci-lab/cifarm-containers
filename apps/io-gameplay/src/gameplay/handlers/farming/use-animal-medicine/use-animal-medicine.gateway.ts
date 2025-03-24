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
import { UseAnimalMedicineMessage } from "./use-animal-medicine.dto"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
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