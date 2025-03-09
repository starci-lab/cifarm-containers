import { Logger } from "@nestjs/common"
import {
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets"
import { SyncEnergyPayload } from "./energy.types"
import { NAMESPACE } from "../gameplay.constants"
import { AuthGateway, SocketData } from "../auth"
import { TypedNamespace } from "@src/io"
import { ENERGY_SYNCED_EVENT } from "./energy.constants"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
    namespace: NAMESPACE
})
export class EnergyGateway implements OnGatewayInit {
    private readonly logger = new Logger(EnergyGateway.name)

    constructor(
        private readonly authGateway: AuthGateway
    ) {}

    @WebSocketServer()
    private readonly namespace: TypedNamespace<SocketData>

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${EnergyGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    public async syncEnergy({ energy, userId }: SyncEnergyPayload) {
        const socket = await this.authGateway.getSocket(this.namespace, userId)
        socket.emit(ENERGY_SYNCED_EVENT, energy)
    }
}
