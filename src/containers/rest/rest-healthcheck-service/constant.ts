import { join } from "path"

export const grpcConstants = {
    SERVICE: "HealthcheckService",
    PACKAGE: "healthcheck",
    PROTO_PATH: join(process.cwd(), "proto", "healthcheck.proto"),
}
