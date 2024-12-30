import { Logger } from "@nestjs/common"
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import { getEnvValue, getHttpUrl, isProduction } from "@src/common/utils"
import { envConfig } from "@src/env"
import { BcryptService } from "@src/crypto/bcrypt"

@WebSocketGateway({
    cors: {
        origin: [
            getEnvValue({
                development: getHttpUrl({
                    port: envConfig().containers.websocketNode.port,
                }),
                production: envConfig().productionUrl
            })
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
    private server: Server

    afterInit() {
        // Initialize the admin UI for the namespace
        instrument(this.server, {
            auth: {
                username: envConfig().socketIoAdmin.username,
                password: this.bcryptService.hash(envConfig().socketIoAdmin.password),
                type: "basic"
            },
            mode: isProduction() ? "production" : "development",
        })
    }
    
    // for testing
    @SubscribeMessage("ping")
    handlePing(): string {
        return "pong"
    }
}
