import { join } from "path"

export const healthcheckGrpcConstants = {
    NAME: "HEALTHCHECK_PACKAGE",
    SERVICE: "HealthcheckService",
    PACKAGE: "healthcheck",
    PROTO_PATH: join(process.cwd(), "proto", "healthcheck.proto"),
}
