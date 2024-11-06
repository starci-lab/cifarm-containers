import { join } from "path"

export const websocketBroadcastGrpcConstants = {
    NAME: "WEBSOCKET_BROADCAST_PACKAGE",
    SERVICE: "WebsocketBroadcastService",
    PACKAGE: "websocket_broadcast",
    PROTO_PATH: join(process.cwd(), "proto", "websocket_broadcast.proto"),
}
