import { join } from "path"

export const gameplayGrpcConstants = {
    NAME: "GAMEPLAY_PACKAGE",
    SERVICE: "GameplayService",
    PACKAGE: "gameplay",
    PROTO_PATH: join(process.cwd(), "proto", "gameplay", "entry.proto")
}
