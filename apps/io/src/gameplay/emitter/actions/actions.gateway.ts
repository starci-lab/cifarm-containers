import { Logger } from "@nestjs/common"
import {
    OnGatewayInit,
    WebSocketServer
} from "@nestjs/websockets"
import { Namespace } from "socket.io"
import { AuthGateway, RoomType } from "../../auth"
import { ActionEmittedMessage, EmitActionPayload } from "./types"
import { EmitterEventName } from "../../events"
import { GameplayWebSocketGateway, NAMESPACE } from "../../gateway.decorators"

@GameplayWebSocketGateway()
export class ActionGateway implements OnGatewayInit {
    private readonly logger = new Logger(ActionGateway.name)

    constructor(
        private readonly authGateway: AuthGateway,
    ) {}

    @WebSocketServer()
    private readonly namespace: Namespace

    afterInit() {
        this.logger.verbose(
            `Initialized gateway with name: ${ActionGateway.name}, namespace: ${NAMESPACE}`
        )
    }

    //sync placed items for all socket visting 
    public async emitAction<TData = undefined>(payload: EmitActionPayload<TData>) {
        // remove userId from payload
        const { userId, ...rest } = payload
        const message: ActionEmittedMessage<TData> = rest
        this.namespace
            .to(
                this.authGateway.getRoomName({
                    userId,
                    type: RoomType.Player
                })
            )
            .emit(EmitterEventName.ActionEmitted, message)
    }
}
