import { join } from "path"

export const healthcheckGrpcConstants = {
    name: "HEALTHCHECK_PACKAGE",
    service: "HealthcheckService",
    package: "healthcheck",
    protoPath: join(process.cwd(), "proto", "healthcheck.proto")
}
