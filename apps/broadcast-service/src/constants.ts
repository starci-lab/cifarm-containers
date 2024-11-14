import { join } from "path"

export const broadcastGrpcConstants = {
    NAME: "BROADCAST_PACKAGE",
    SERVICE: "BroadcastService",
    PACKAGE: "broadcast",
    PROTO_PATH: join(process.cwd(), "proto", "broadcast.proto")
}
