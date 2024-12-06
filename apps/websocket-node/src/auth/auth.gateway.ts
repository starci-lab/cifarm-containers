import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager"
import { Inject, Logger, UseGuards } from "@nestjs/common"
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets"
import { WsUser } from "@src/decorators"
import { WsJwtAuthGuard } from "@src/guards"
import { UserLike } from "@src/services"
import { Socket } from "socket.io"
import { HandleLinkSessionResponse } from "./auth.dto"
import { Namespace, namespaceConstants } from "../app.constants"

@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: namespaceConstants[Namespace.Default].NAMESPACE
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly logger = new Logger(AuthGateway.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    afterInit() {
        this.logger.debug("Auth gateway initialized")
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`)
        //Retrieve the user id from the cache
        const userId = (await this.cacheManager.get(client.id)) as string
        if (userId) {
            this.logger.debug(`User disconnected: ${userId}`)

            //delete the client from the cache
            this.logger.verbose("Deleting cache...")
            await Promise.all([this.cacheManager.del(client.id), this.cacheManager.del(userId)])
        }
    }

    public handleConnection(@ConnectedSocket() client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`)
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage(namespaceConstants[Namespace.Default].events.LINK_SESSION)
    public async handleLinkSession(
        @WsUser() user: UserLike,
        @ConnectedSocket() client: Socket
    ): Promise<HandleLinkSessionResponse> {
        this.logger.debug(`User authenticated: ${user.id} - ${client.id}`)
        //map the user and client to the cache, with persistence of 0

        this.logger.verbose("Setting cache...")
        await Promise.all([
            this.cacheManager.set(user.id, client.id, 0),
            this.cacheManager.set(client.id, user.id, 0)
        ])

        return {}
    }
}
