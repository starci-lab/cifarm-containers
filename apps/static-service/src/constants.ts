import { join } from "path"

export const staticGrpcConstants = {
    NAME: "STATIC_PACKAGE",
    SERVICE: "StaticService",
    PACKAGE: "static",
    PROTO_PATH: join(process.cwd(), "proto", "static/entry.proto")
}
