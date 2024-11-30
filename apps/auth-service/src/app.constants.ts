import { join } from "path"

export const authGrpcConstants = {
    name: "AUTH_PACKAGE",
    service: "AuthService",
    package: "auth_service",
    protoPath: join(process.cwd(), "proto", "auth_service", "entry.proto")
}
