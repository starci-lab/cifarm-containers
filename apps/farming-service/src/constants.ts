import { join } from "path"

export const farmingGrpcConstants = {
    NAME: "FARMING_PACKAGE",
    SERVICE: "FarmingService",
    PACKAGE: "farming",
    PROTO_PATH: join(process.cwd(), "proto", "gameplay/farming/entry.proto")
}
