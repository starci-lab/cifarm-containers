import { Logger, UseGuards } from "@nestjs/common"
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import { isProduction, envConfig } from "@src/env"
import { BcryptService } from "@src/crypto"
import { WsThrottlerGuard } from "@src/throttler"

@WebSocketGateway({
    cors: {
        origin: "*",
        credentials: true
    },
})
export class DefaultGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(DefaultGateway.name)

    constructor(
        private readonly bcryptService: BcryptService,
    ) { }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`)
    }

    handleConnection(client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`)
    }

    @WebSocketServer()
    private readonly server: Server

    afterInit() {
        // Initialize the admin UI for the namespace
        instrument(this.server, {
            auth: {
                username: envConfig().socketIoAdmin.username,
                password: this.bcryptService.hash(envConfig().socketIoAdmin.password),
                type: "basic"
            },
            namespaceName: "/admin",
            mode: isProduction() ? "production" : "development",
        })
    }
    
    // for testing
    
    @UseGuards(WsThrottlerGuard)
    @SubscribeMessage("ping")
    handlePing():  WsResponse<string> {
        this.logger.debug("Received ping")
        return {
            event: "ping",
            data: "pong"
        }
    }
}
