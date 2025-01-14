import { Logger } from "@nestjs/common"
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
import { getHttpUrl } from "@src/common"
import { BcryptService } from "@src/crypto"
import { Cron } from "@nestjs/schedule"

@WebSocketGateway({
    cors: {
        origin: [
            isProduction() ? getHttpUrl({
                port: envConfig().containers.websocketNode.port,
            }) : envConfig().productionUrl,
        ],
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

    @Cron("*/5 * * * * *")
    public printSids() {
        const adapter = this.server.of("/").adapter
        const keys = adapter.sids.keys()
        this.logger.debug(`Sids: ${Array.from(keys)}`)
    }

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
    @SubscribeMessage("ping")
    handlePing():  WsResponse<string> {
        this.logger.debug("Received ping")
        return {
            event: "ping",
            data: "pong"
        }
    }
}
