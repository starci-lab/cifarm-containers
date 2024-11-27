import { join } from "path"

export const authGrpcConstants = {
    NAME: "AUTH_PACKAGE",
    SERVICE: "AuthService",
    PACKAGE: "auth",
    PROTO_PATH: join(process.cwd(), "proto", "auth_service", "entry.proto"),
}