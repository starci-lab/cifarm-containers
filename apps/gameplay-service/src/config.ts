import { join } from "path"

export const gameplayGrpcConstants = {
    name: "GAMEPLAY_PACKAGE",
    service: "GameplayService",
    package: "gameplay",
    protoPath: join(process.cwd(), "proto", "gameplay_service", "entry.proto")
}

export const speedUpConstants = {
    key: "speedUp"
}
