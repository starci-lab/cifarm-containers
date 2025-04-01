import { GatewayMetadata, WebSocketGateway } from "@nestjs/websockets"
import { envConfig } from "@src/env"

export const NAMESPACE = "gameplay"
export const config = (): GatewayMetadata => ({
    cors: {
        origin: envConfig().cors.ws,
        credentials: true,
    },
    namespace: NAMESPACE,
})

export const GameplayWebSocketGateway = () => WebSocketGateway(config())
